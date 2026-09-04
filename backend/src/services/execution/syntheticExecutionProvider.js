import { AppError } from "../../utils/appError.js";
import { ExecutionProvider } from "./executionProvider.js";
import { syntheticDataset } from "../simulation/syntheticDataset.js";

const supported = new Set(["QUERY_RESOURCE", "VALIDATE_SCOPE", "ARCHIVE_RESOURCE", "DELETE_RESOURCE"]);
const clone = (value) => structuredClone(value);
const stable = (value) => Array.isArray(value) ? value.map(stable) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([left],[right]) => left.localeCompare(right)).map(([key,item]) => [key,stable(item)])) : value;
const sameJson = (left,right) => JSON.stringify(stable(left)) === JSON.stringify(stable(right));

export class SyntheticExecutionProvider extends ExecutionProvider {
  constructor() { super("SYNTHETIC"); }

  execute(plan, simulation) {
    const state = clone(syntheticDataset);
    const effects = [...simulation.effects];
    const mutating = plan.actions.filter((action) => ["ARCHIVE_RESOURCE", "DELETE_RESOURCE"].includes(action.type));
    if (mutating.length !== 1) throw new AppError(422, "EXECUTION_PREREQUISITE_MISSING", "Execution requires exactly one persisted synthetic mutation");
    const mutationEffects = effects.filter((effect) => effect.planActionId === mutating[0].id);
    if (mutationEffects.length !== simulation.affectedResources || mutationEffects.some((effect) => effect.resourceType !== mutating[0].resourceType)) throw new AppError(409, "EXECUTION_PREREQUISITE_MISSING", "Persisted simulation scope is inconsistent");
    const keys = new Set(mutationEffects.map((effect) => effect.resourceKey));
    if (keys.size !== mutationEffects.length) throw new AppError(409, "EXECUTION_PREREQUISITE_MISSING", "Persisted simulation scope contains duplicate resources");

    return [...plan.actions].sort((a, b) => a.position - b.position).map((action) => {
      if (!supported.has(action.type)) throw new AppError(422, "UNSUPPORTED_EXECUTION_ACTION", "This action cannot be executed safely by the synthetic provider");
      if (action.type === "QUERY_RESOURCE") return { planActionId: action.id, position: action.position, actionType: action.type, resourceType: action.resourceType, matchedCount: simulation.matchedResources, affectedCount: 0, reversible: true, summary: `Queried ${simulation.totalResourcesExamined} isolated synthetic resources and matched ${simulation.matchedResources}.`, beforeJson: [], afterJson: [] };
      if (action.type === "VALIDATE_SCOPE") return { planActionId: action.id, position: action.position, actionType: action.type, resourceType: action.resourceType, matchedCount: simulation.matchedResources, affectedCount: 0, reversible: true, summary: `Validated ${simulation.matchedResources} persisted synthetic matches.`, beforeJson: [], afterJson: [] };
      const ownedEffects = effects.filter((effect) => effect.planActionId === action.id);
      for (const effect of ownedEffects) {
        const resource = state[action.resourceType]?.find((candidate) => candidate.id === effect.resourceKey);
        if (!resource || !sameJson(resource,effect.beforeState)) throw new AppError(409, "EXECUTION_PREREQUISITE_MISSING", "Persisted simulation evidence does not match the canonical synthetic fixture");
        Object.assign(resource, clone(effect.afterState));
      }
      return { planActionId: action.id, position: action.position, actionType: action.type, resourceType: action.resourceType, matchedCount: ownedEffects.length, affectedCount: ownedEffects.length, reversible: action.reversible, summary: `${action.type === "ARCHIVE_RESOURCE" ? "Archived" : "Tombstoned"} ${ownedEffects.length} resources in isolated synthetic state.`, beforeJson: ownedEffects.map((effect) => ({ resourceKey: effect.resourceKey, state: effect.beforeState })), afterJson: ownedEffects.map((effect) => ({ resourceKey: effect.resourceKey, state: effect.afterState })) };
    });
  }
}

export const syntheticExecutionProvider = new SyntheticExecutionProvider();
