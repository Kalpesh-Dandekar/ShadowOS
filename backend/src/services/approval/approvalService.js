import { getDatabase } from "../../config/database.js";
import { AppError } from "../../utils/appError.js";

const identitySelect = { id: true, name: true, email: true, role: true };
const approvalInclude = { requester: { select: identitySelect }, reviewer: { select: identitySelect }, policyEvaluation: { include: { matches: { orderBy: { priority: "desc" } }, riskAssessment: { include: { factors: { orderBy: { key: "asc" } }, simulationRun: { include: { effects: true, plan: { include: { actions: { orderBy: { position: "asc" } }, request: { select: { id: true, prompt: true, environment: true, createdAt: true, updatedAt: true, userId: true } } } } } } } } } } };

async function ownedPolicy(userId, requestId) { const request = await getDatabase().request.findFirst({ where: { id: requestId, userId }, include: { executionPlan: { include: { simulationRun: { include: { riskAssessment: { include: { policyEvaluation: { include: { approvalRequest: { include: { requester: { select: identitySelect }, reviewer: { select: identitySelect } } } } } } } } } } } } }); if (!request) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found"); const policy = request.executionPlan?.simulationRun?.riskAssessment?.policyEvaluation; if (!policy) throw new AppError(409, "POLICY_EVALUATION_REQUIRED", "A persisted policy evaluation is required before approval"); return { request, policy }; }

export async function createOwnedApproval(userId, requestId) { const { request, policy } = await ownedPolicy(userId, requestId); if (policy.decision === "ALLOW") throw new AppError(409, "APPROVAL_NOT_REQUIRED", "This policy decision does not require approval"); if (policy.decision === "BLOCK") throw new AppError(409, "APPROVAL_BLOCKED_BY_POLICY", "Blocked policy decisions cannot request approval"); if (policy.approvalRequest) return policy.approvalRequest; try { return await getDatabase().approvalRequest.create({ data: { policyEvaluationId: policy.id, requesterId: request.userId }, include: { requester: { select: identitySelect }, reviewer: { select: identitySelect } } }); } catch (error) { if (error.code === "P2002") return getDatabase().approvalRequest.findUnique({ where: { policyEvaluationId: policy.id }, include: { requester: { select: identitySelect }, reviewer: { select: identitySelect } } }); throw error; } }

export async function getOwnedRequestApproval(userId, requestId) { const { policy } = await ownedPolicy(userId, requestId); if (!policy.approvalRequest) throw new AppError(404, "APPROVAL_NOT_FOUND", "Approval request not found"); return policy.approvalRequest; }

export async function listReviewerApprovals(status) {
  return getDatabase().approvalRequest.findMany({
    where: { status }, orderBy: { requestedAt: "asc" },
    select: { id: true, status: true, requestedAt: true, requester: { select: identitySelect }, policyEvaluation: { select: { decision: true, riskAssessment: { select: { score: true, level: true, simulationRun: { select: { plan: { select: { request: { select: { id: true, prompt: true, environment: true } } } } } } } } } } },
  });
}

export async function getApprovalDetail(user, approvalId) { const approval = await getDatabase().approvalRequest.findUnique({ where: { id: approvalId }, include: approvalInclude }); if (!approval || (user.role === "EMPLOYEE" && approval.requesterId !== user.id)) throw new AppError(404, "APPROVAL_NOT_FOUND", "Approval request not found"); return approval; }

async function decide(user, approvalId, status, reviewComment) { const existing = await getDatabase().approvalRequest.findUnique({ where: { id: approvalId }, select: { requesterId: true, status: true } }); if (!existing) throw new AppError(404, "APPROVAL_NOT_FOUND", "Approval request not found"); if (existing.requesterId === user.id) throw new AppError(403, "SELF_APPROVAL_FORBIDDEN", "You cannot decide your own approval request"); if (existing.status !== "PENDING") throw new AppError(409, "APPROVAL_ALREADY_DECIDED", "This approval request has already been decided"); const result = await getDatabase().approvalRequest.updateMany({ where: { id: approvalId, status: "PENDING" }, data: { status, reviewerId: user.id, reviewComment: reviewComment || null, decidedAt: new Date() } }); if (result.count !== 1) throw new AppError(409, "APPROVAL_ALREADY_DECIDED", "This approval request has already been decided"); return getApprovalDetail(user, approvalId); }
export const approveRequest = (user, id, comment) => decide(user, id, "APPROVED", comment);
export const rejectRequest = (user, id, comment) => decide(user, id, "REJECTED", comment);
