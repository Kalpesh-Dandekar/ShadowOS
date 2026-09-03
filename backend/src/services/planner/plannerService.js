import { getDatabase } from "../../config/database.js";
import { planCandidateSchema } from "../../schemas/planSchemas.js";
import { AppError } from "../../utils/appError.js";
import { simulationPlannerProvider } from "./simulationPlannerProvider.js";

const safePlanSelect = {
  id: true,
  requestId: true,
  provider: true,
  summary: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  actions: {
    orderBy: { position: "asc" },
    select: {
      id: true,
      position: true,
      type: true,
      resourceType: true,
      description: true,
      target: true,
      destructive: true,
      reversible: true,
      estimatedScope: true,
      reason: true,
      createdAt: true,
    },
  },
};

async function ownedRequest(userId, requestId) {
  const request = await getDatabase().request.findFirst({
    where: { id: requestId, userId },
    include: { executionPlan: { select: safePlanSelect } },
  });
  if (!request) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  return request;
}

export async function getOwnedPlan(userId, requestId) {
  const request = await ownedRequest(userId, requestId);
  if (!request.executionPlan) throw new AppError(404, "PLAN_NOT_FOUND", "Action plan not found");
  return request.executionPlan;
}

export async function generateOwnedPlan(userId, requestId, provider = simulationPlannerProvider) {
  const database = getDatabase();
  let request = await ownedRequest(userId, requestId);
  if (request.executionPlan) return request.executionPlan;
  if (request.status === "PLANNING") throw new AppError(409, "PLANNING_IN_PROGRESS", "Planning is already in progress");
  if (request.status !== "SUBMITTED") throw new AppError(409, "REQUEST_NOT_PLANNABLE", "Request is not available for planning");

  const claimed = await database.request.updateMany({
    where: { id: requestId, userId, status: "SUBMITTED" },
    data: { status: "PLANNING" },
  });
  if (claimed.count !== 1) {
    request = await ownedRequest(userId, requestId);
    if (request.executionPlan) return request.executionPlan;
    throw new AppError(409, "PLANNING_IN_PROGRESS", "Planning is already in progress");
  }

  try {
    const parsed = planCandidateSchema.safeParse(await provider.generatePlan(request));
    if (!parsed.success) throw new AppError(422, "PLANNER_OUTPUT_INVALID", "Planner output failed structural validation");

    return await database.$transaction(async (transaction) => {
      const plan = await transaction.executionPlan.create({
        data: {
          requestId,
          provider: provider.type,
          summary: parsed.data.summary,
          status: "GENERATED",
          actions: { create: parsed.data.actions },
        },
        select: safePlanSelect,
      });
      const transitioned = await transaction.request.updateMany({
        where: { id: requestId, userId, status: "PLANNING" },
        data: { status: "PLANNED" },
      });
      if (transitioned.count !== 1) throw new Error("Request planning transition was lost");
      return plan;
    });
  } catch (error) {
    await database.request.updateMany({
      where: { id: requestId, userId, status: "PLANNING" },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

export { safePlanSelect };
