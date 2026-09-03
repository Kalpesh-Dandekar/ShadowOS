import { getDatabase } from "../../config/database.js";
import { policyEvaluationCandidateSchema } from "../../schemas/policySchemas.js";
import { AppError } from "../../utils/appError.js";
import { buildPolicyContext, evaluatePolicyRules } from "./policyEngine.js";

const safePolicySelect = { id: true, riskAssessmentId: true, decision: true, summary: true, evaluatedRuleCount: true, matchedRuleCount: true, createdAt: true, updatedAt: true, matches: { orderBy: [{ priority: "desc" }, { ruleKey: "asc" }], select: { id: true, ruleKey: true, ruleName: true, decision: true, priority: true, observedFacts: true, explanation: true, createdAt: true } } };

async function ownedPolicyContext(userId, requestId) {
  const request = await getDatabase().request.findFirst({ where: { id: requestId, userId }, include: { executionPlan: { include: { actions: { orderBy: { position: "asc" } }, simulationRun: { include: { effects: true, riskAssessment: { include: { factors: true, policyEvaluation: { select: safePolicySelect } } } } } } } } });
  if (!request) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  const plan = request.executionPlan; const simulation = plan?.simulationRun; const risk = simulation?.riskAssessment;
  if (!risk) throw new AppError(409, "RISK_ASSESSMENT_REQUIRED", "A persisted risk assessment is required before policy evaluation");
  return { request, plan, simulation, risk };
}

export async function getOwnedPolicy(userId, requestId) { const context = await ownedPolicyContext(userId, requestId); if (!context.risk.policyEvaluation) throw new AppError(404, "POLICY_EVALUATION_NOT_FOUND", "Policy evaluation not found"); return context.risk.policyEvaluation; }

export async function evaluateOwnedPolicy(userId, requestId) {
  const source = await ownedPolicyContext(userId, requestId); if (source.risk.policyEvaluation) return source.risk.policyEvaluation;
  const parsed = policyEvaluationCandidateSchema.safeParse(evaluatePolicyRules(buildPolicyContext(source)));
  if (!parsed.success) throw new AppError(422, "INVALID_POLICY_INPUT", "Policy engine output failed structural validation");
  return getDatabase().$transaction((transaction) => transaction.policyEvaluation.create({ data: { riskAssessmentId: source.risk.id, decision: parsed.data.decision, summary: parsed.data.summary, evaluatedRuleCount: parsed.data.evaluatedRuleCount, matchedRuleCount: parsed.data.matchedRuleCount, matches: { create: parsed.data.matches } }, select: safePolicySelect }));
}
