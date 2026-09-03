import { AppError } from "../../utils/appError.js";
import { SimulationProvider } from "./simulationProvider.js";
import { SYNTHETIC_REFERENCE_DATE, syntheticDataset } from "./syntheticDataset.js";

function selectResources(resourceType, target) {
  const resources = syntheticDataset[resourceType];
  if (!resources) throw new AppError(422, "UNSUPPORTED_SIMULATION_ACTION", "This plan contains an action that cannot be simulated safely");
  if (resourceType === "INVOICE") {
    return resources.filter((resource) => resource.status === target.status && (!target.before || resource.createdAt < target.before));
  }
  if (resourceType === "CUSTOMER_ACCOUNT") {
    const referenceYear = Number(SYNTHETIC_REFERENCE_DATE.slice(0, 4));
    const threshold = `${referenceYear - Number(target.olderThanYears || 0)}-01-01`;
    return resources.filter((resource) => resource.status === target.status && !resource.archived && resource.inactiveSince && resource.inactiveSince < threshold);
  }
  throw new AppError(422, "UNSUPPORTED_SIMULATION_ACTION", "This plan contains an action that cannot be simulated safely");
}

function project(action, resource) {
  if (action.type === "ARCHIVE_RESOURCE") {
    return { planActionId: action.id, resourceKey: resource.id, resourceType: action.resourceType, effectType: "ARCHIVE_RESOURCE", beforeState: { ...resource }, afterState: { ...resource, status: "archived", archived: true }, changed: true };
  }
  if (action.type === "DELETE_RESOURCE") {
    return { planActionId: action.id, resourceKey: resource.id, resourceType: action.resourceType, effectType: "DELETE_RESOURCE", beforeState: { ...resource }, afterState: { deleted: true }, changed: true };
  }
  throw new AppError(422, "UNSUPPORTED_SIMULATION_ACTION", "This plan contains an action that cannot be simulated safely");
}

export class SyntheticSimulationProvider extends SimulationProvider {
  constructor() { super("SYNTHETIC"); }

  simulate(plan) {
    const examined = new Set();
    let matched = [];
    let matchedResourceType = null;
    let effects = [];

    for (const action of [...plan.actions].sort((left, right) => left.position - right.position)) {
      if (action.type === "QUERY_RESOURCE") {
        const source = syntheticDataset[action.resourceType];
        if (!source) throw new AppError(422, "UNSUPPORTED_SIMULATION_ACTION", "This plan contains an action that cannot be simulated safely");
        source.forEach((resource) => examined.add(`${action.resourceType}:${resource.id}`));
        matched = selectResources(action.resourceType, action.target);
        matchedResourceType = action.resourceType;
      } else if (action.type === "VALIDATE_SCOPE") {
        if (matchedResourceType !== action.resourceType) throw new AppError(422, "UNSUPPORTED_SIMULATION_ACTION", "Plan scope cannot be simulated safely");
      } else if (action.type === "ARCHIVE_RESOURCE" || action.type === "DELETE_RESOURCE") {
        if (matchedResourceType !== action.resourceType) throw new AppError(422, "UNSUPPORTED_SIMULATION_ACTION", "Plan scope cannot be simulated safely");
        effects = matched.map((resource) => project(action, resource));
      } else {
        throw new AppError(422, "UNSUPPORTED_SIMULATION_ACTION", "This plan contains an action that cannot be simulated safely");
      }
    }

    const dependencyObservations = effects.filter((effect) => Number(effect.beforeState.dependencyCount) > 0).length;
    return {
      summary: `Examined ${examined.size} synthetic resources, matched ${matched.length}, and projected ${effects.length} changes.`,
      totalResourcesExamined: examined.size,
      matchedResources: matched.length,
      affectedResources: effects.length,
      dependencyObservations,
      effects,
    };
  }
}

export const syntheticSimulationProvider = new SyntheticSimulationProvider();
