import { AppError } from "../../utils/appError.js";
import { evaluateRiskFactors } from "./riskFactorEvaluators.js";

export const RISK_THRESHOLDS = Object.freeze([
  { minimum: 75, level: "CRITICAL" },
  { minimum: 50, level: "HIGH" },
  { minimum: 25, level: "MEDIUM" },
  { minimum: 0, level: "LOW" },
]);

export function levelForScore(score) { return RISK_THRESHOLDS.find((threshold) => score >= threshold.minimum).level; }

function validateInputs(context) {
  const { simulation, plan } = context;
  const actionIds = new Set(plan.actions.map((action) => action.id));
  if (simulation.status !== "COMPLETED" || simulation.affectedResources !== simulation.effects.length || simulation.dependencyObservations > simulation.affectedResources || simulation.effects.some((effect) => !actionIds.has(effect.planActionId) || !effect.changed)) {
    throw new AppError(422, "INVALID_RISK_INPUT", "Persisted governance facts are inconsistent for risk evaluation");
  }
}

export function calculateRisk(context) {
  validateInputs(context);
  const factors = evaluateRiskFactors(context);
  const score = Math.max(0, Math.min(100, Math.round(factors.reduce((sum, factor) => sum + factor.contribution, 0))));
  const level = levelForScore(score);
  const destructive = factors.find((factor) => factor.key === "destructive_operation").normalizedScore > 0;
  const irreversible = factors.find((factor) => factor.key === "irreversibility").normalizedScore > 0;
  const summary = `${level.charAt(0)}${level.slice(1).toLowerCase()} risk driven by ${destructive ? "a destructive" : "a non-destructive"}, ${irreversible ? "irreversible" : "reversible"} operation in ${context.request.environment}, with ${context.simulation.affectedResources} synthetic projected changes and ${context.simulation.dependencyObservations} dependency observations.`;
  return { score, level, summary, factors };
}
