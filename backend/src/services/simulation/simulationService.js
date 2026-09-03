import { getDatabase } from "../../config/database.js";
import { simulationCandidateSchema } from "../../schemas/simulationSchemas.js";
import { AppError } from "../../utils/appError.js";
import { syntheticSimulationProvider } from "./syntheticSimulationProvider.js";

const safeSimulationSelect = {
  id: true,
  planId: true,
  provider: true,
  status: true,
  totalResourcesExamined: true,
  matchedResources: true,
  affectedResources: true,
  dependencyObservations: true,
  summary: true,
  createdAt: true,
  updatedAt: true,
  effects: { orderBy: [{ resourceKey: "asc" }], select: { id: true, planActionId: true, resourceKey: true, resourceType: true, effectType: true, beforeState: true, afterState: true, changed: true, createdAt: true } },
};

async function ownedSimulationContext(userId, requestId) {
  const request = await getDatabase().request.findFirst({
    where: { id: requestId, userId },
    include: { executionPlan: { include: { actions: { orderBy: { position: "asc" } }, simulationRun: { select: safeSimulationSelect } } } },
  });
  if (!request) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  if (!request.executionPlan || request.executionPlan.status !== "GENERATED") throw new AppError(409, "PLAN_REQUIRED", "A generated action plan is required before simulation");
  return request.executionPlan;
}

export async function getOwnedSimulation(userId, requestId) {
  const plan = await ownedSimulationContext(userId, requestId);
  if (!plan.simulationRun) throw new AppError(404, "SIMULATION_NOT_FOUND", "Shadow simulation not found");
  return plan.simulationRun;
}

export async function runOwnedSimulation(userId, requestId, provider = syntheticSimulationProvider) {
  const plan = await ownedSimulationContext(userId, requestId);
  if (plan.simulationRun) return plan.simulationRun;
  const parsed = simulationCandidateSchema.safeParse(await provider.simulate(plan));
  if (!parsed.success) throw new AppError(422, "SIMULATION_OUTPUT_INVALID", "Simulation output failed structural validation");
  return getDatabase().$transaction((transaction) => transaction.simulationRun.create({
    data: {
      planId: plan.id,
      provider: provider.type,
      status: "COMPLETED",
      totalResourcesExamined: parsed.data.totalResourcesExamined,
      matchedResources: parsed.data.matchedResources,
      affectedResources: parsed.data.affectedResources,
      dependencyObservations: parsed.data.dependencyObservations,
      summary: parsed.data.summary,
      effects: { create: parsed.data.effects },
    },
    select: safeSimulationSelect,
  }));
}

export { safeSimulationSelect };
