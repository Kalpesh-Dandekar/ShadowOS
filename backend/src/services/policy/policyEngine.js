import { AppError } from "../../utils/appError.js";
import { levelForScore } from "../risk/riskEngine.js";
import { POLICY_RULES } from "./policyRules.js";

export const POLICY_DECISION_PRECEDENCE = Object.freeze({ ALLOW: 1, REQUIRE_APPROVAL: 2, BLOCK: 3 });
const mutationTypes = new Set(["CREATE_RESOURCE", "UPDATE_RESOURCE", "ARCHIVE_RESOURCE", "DELETE_RESOURCE"]);

export function buildPolicyContext(source) {
  const { request, plan, simulation, risk } = source;
  const actionIds = new Set(plan.actions.map((action) => action.id));
  if (simulation.status !== "COMPLETED" || simulation.affectedResources !== simulation.effects.length || simulation.dependencyObservations > simulation.affectedResources || simulation.effects.some((effect) => !actionIds.has(effect.planActionId) || !effect.changed) || risk.score < 0 || risk.score > 100 || risk.level !== levelForScore(risk.score) || risk.factors.length !== 6 || new Set(risk.factors.map((factor) => factor.key)).size !== 6) {
    throw new AppError(422, "INVALID_POLICY_INPUT", "Persisted governance facts are inconsistent for policy evaluation");
  }
  return { request: { id: request.id, environment: request.environment }, plan: { id: plan.id }, mutationActions: plan.actions.filter((action) => mutationTypes.has(action.type)), simulation: { id: simulation.id, affectedResources: simulation.affectedResources, dependencyObservations: simulation.dependencyObservations }, risk: { id: risk.id, score: risk.score, level: risk.level } };
}

export function resolvePolicyDecision(matches) {
  if (matches.length === 0) return "ALLOW";
  return matches.reduce((current, match) => POLICY_DECISION_PRECEDENCE[match.decision] > POLICY_DECISION_PRECEDENCE[current] ? match.decision : current, "ALLOW");
}

export function evaluatePolicyRules(context) {
  const matches = POLICY_RULES.filter((definition) => definition.evaluate(context)).map((definition) => ({ ruleKey: definition.key, ruleName: definition.name, decision: definition.decision, priority: definition.priority, observedFacts: definition.observe(context), explanation: definition.explain(context) })).sort((a, b) => b.priority - a.priority || a.ruleKey.localeCompare(b.ruleKey));
  const decision = resolvePolicyDecision(matches);
  const summary = decision === "BLOCK" ? "Blocked by deterministic governance policy. No execution has occurred." : decision === "REQUIRE_APPROVAL" ? "Approval is required before continuation. No approval request has been created." : "Allowed by policy. No execution has occurred.";
  return { decision, summary, evaluatedRuleCount: POLICY_RULES.length, matchedRuleCount: matches.length, matches };
}
