export const RISK_WEIGHTS = Object.freeze({ destructive_operation: 0.25, irreversibility: 0.25, projected_scope: 0.15, dependency_exposure: 0.15, environment: 0.10, operation_severity: 0.10 });

const contribution = (normalizedScore, weight) => Math.round(normalizedScore * weight * 100) / 100;
const factor = (key, label, observedValue, normalizedScore, explanation, sourceType) => ({ key, label, observedValue, normalizedScore, weight: RISK_WEIGHTS[key], contribution: contribution(normalizedScore, RISK_WEIGHTS[key]), explanation, sourceType });

const scopeScore = (count) => count === 0 ? 0 : count <= 2 ? 25 : count <= 10 ? 50 : count <= 50 ? 75 : 100;
const dependencyScore = (count) => count === 0 ? 0 : count === 1 ? 40 : count <= 5 ? 70 : 100;
const environmentScores = { DEVELOPMENT: 0, STAGING: 50, PRODUCTION: 100 };
const severityScores = { CREATE_RESOURCE: 25, UPDATE_RESOURCE: 50, ARCHIVE_RESOURCE: 50, DELETE_RESOURCE: 100 };

export function evaluateRiskFactors(context) {
  const mutations = context.plan.actions.filter((action) => ["CREATE_RESOURCE", "UPDATE_RESOURCE", "ARCHIVE_RESOURCE", "DELETE_RESOURCE"].includes(action.type));
  const destructive = mutations.some((action) => action.destructive);
  const irreversible = mutations.some((action) => !action.reversible);
  const severity = Math.max(0, ...mutations.map((action) => severityScores[action.type] ?? 0));
  const operation = mutations.sort((left, right) => (severityScores[right.type] ?? 0) - (severityScores[left.type] ?? 0))[0]?.type ?? "NONE";
  return [
    factor("destructive_operation", "Destructive operation", { present: destructive }, destructive ? 100 : 0, destructive ? "The plan contains a destructive semantic mutation over synthetic resources." : "The plan contains no destructive mutation action.", "PLAN"),
    factor("irreversibility", "Irreversibility", { present: irreversible }, irreversible ? 100 : 0, irreversible ? "A mutation is marked non-reversible, increasing recovery difficulty." : "All mutation actions are marked reversible.", "PLAN"),
    factor("projected_scope", "Projected change scope", { affectedResources: context.simulation.affectedResources }, scopeScore(context.simulation.affectedResources), `${context.simulation.affectedResources} synthetic resources would change.`, "SIMULATION"),
    factor("dependency_exposure", "Dependency exposure", { dependencyObservations: context.simulation.dependencyObservations }, dependencyScore(context.simulation.dependencyObservations), `${context.simulation.dependencyObservations} projected resources have synthetic dependency relationships.`, "SIMULATION"),
    factor("environment", "Environment", { environment: context.request.environment }, environmentScores[context.request.environment], `The request targets the ${context.request.environment.toLowerCase()} environment.`, "REQUEST"),
    factor("operation_severity", "Operation severity", { actionType: operation }, severity, `${operation} is the highest-severity mutation in the plan.`, "PLAN"),
  ];
}
