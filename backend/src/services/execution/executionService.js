import { getDatabase } from "../../config/database.js";
import { AppError } from "../../utils/appError.js";
import { auditData } from "../audit/auditService.js";
import { syntheticExecutionProvider } from "./syntheticExecutionProvider.js";

export const executionInclude = { actor: { select: { id: true, name: true, email: true, role: true } }, approvalRequest: { select: { id: true, status: true, reviewerId: true, decidedAt: true } }, actionResults: { orderBy: { position: "asc" } }, rollbackRun: { include: { actor: { select: { id: true, name: true, email: true, role: true } }, actionResults: { orderBy: { position: "asc" } } } }, policyEvaluation: { select: { decision: true } }, request: { select: { id: true, prompt: true, environment: true, userId: true } } };

async function ownedEvidence(userId, requestId) {
  const request = await getDatabase().request.findFirst({ where: { id: requestId, userId }, include: { executionRun: { include: executionInclude }, executionPlan: { include: { actions: { orderBy: { position: "asc" } }, simulationRun: { include: { effects: true, riskAssessment: { include: { policyEvaluation: { include: { approvalRequest: true } } } } } } } } } });
  if (!request) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  const plan = request.executionPlan, simulation = plan?.simulationRun, risk = simulation?.riskAssessment, policy = risk?.policyEvaluation;
  if (!plan || !simulation || !risk || !policy) throw new AppError(409, "EXECUTION_PREREQUISITE_MISSING", "Persisted plan, simulation, risk, and policy evidence are required");
  return { request, plan, simulation, risk, policy };
}

function assertEligible(policy) {
  if (policy.decision === "BLOCK") throw new AppError(409, "EXECUTION_BLOCKED_BY_POLICY", "Blocked policy decisions cannot execute");
  if (policy.decision !== "REQUIRE_APPROVAL") return;
  if (!policy.approvalRequest) throw new AppError(409, "EXECUTION_APPROVAL_REQUIRED", "An approval request is required before execution");
  if (policy.approvalRequest.status === "PENDING") throw new AppError(409, "EXECUTION_APPROVAL_PENDING", "Approval is still pending");
  if (policy.approvalRequest.status === "REJECTED") throw new AppError(409, "EXECUTION_APPROVAL_REJECTED", "Approval was rejected");
}

export async function executeOwnedRequest(userId, requestId) {
  const evidence = await ownedEvidence(userId, requestId);
  if (evidence.request.executionRun) return evidence.request.executionRun;
  assertEligible(evidence.policy);
  const results = syntheticExecutionProvider.execute(evidence.plan, evidence.simulation);
  const now = new Date();
  try {
    return await getDatabase().$transaction(async (tx) => {
      const run = await tx.executionRun.create({ data: { requestId, planId: evidence.plan.id, simulationRunId: evidence.simulation.id, riskAssessmentId: evidence.risk.id, policyEvaluationId: evidence.policy.id, approvalRequestId: evidence.policy.approvalRequest?.id, actorUserId: userId, provider: "SYNTHETIC", status: "RUNNING", summary: "Synthetic execution is running.", startedAt: now } });
      await tx.auditEvent.create({ data: auditData(requestId, userId, "EXECUTION_STARTED", "EXECUTION", run.id, "Synthetic execution started.", { provider: "SYNTHETIC" }) });
      await tx.executionActionResult.createMany({ data: results.map((result) => ({ ...result, executionRunId: run.id, status: "COMPLETED" })) });
      const completed = await tx.executionRun.update({ where: { id: run.id }, data: { status: "COMPLETED", completedAt: new Date(), summary: `Synthetic execution completed ${results.length} ordered actions; no production resources were modified.` } });
      await tx.auditEvent.create({ data: auditData(requestId, userId, "EXECUTION_COMPLETED", "EXECUTION", run.id, "Synthetic execution completed.", { actionCount: results.length, affectedCount: results.reduce((sum, result) => sum + result.affectedCount, 0) }) });
      return tx.executionRun.findUnique({ where: { id: completed.id }, include: executionInclude });
    });
  } catch (error) {
    if (error.code === "P2002") return getDatabase().executionRun.findUnique({ where: { requestId }, include: executionInclude });
    throw error;
  }
}

export async function getOwnedRequestExecution(userId, requestId) { await ownedEvidence(userId, requestId); const run = await getDatabase().executionRun.findUnique({ where: { requestId }, include: executionInclude }); if (!run) throw new AppError(404, "EXECUTION_NOT_FOUND", "Execution run not found"); return run; }
export async function getOwnedExecution(userId, executionId) { const run = await getDatabase().executionRun.findFirst({ where: { id: executionId, request: { userId } }, include: executionInclude }); if (!run) throw new AppError(404, "EXECUTION_NOT_FOUND", "Execution run not found"); return run; }
