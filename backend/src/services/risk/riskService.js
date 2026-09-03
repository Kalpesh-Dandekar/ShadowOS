import { getDatabase } from "../../config/database.js";
import { riskAssessmentCandidateSchema } from "../../schemas/riskSchemas.js";
import { AppError } from "../../utils/appError.js";
import { calculateRisk } from "./riskEngine.js";

const safeRiskSelect = {
  id: true,
  simulationRunId: true,
  score: true,
  level: true,
  summary: true,
  createdAt: true,
  updatedAt: true,
  factors: { orderBy: { key: "asc" }, select: { id: true, key: true, label: true, observedValue: true, normalizedScore: true, weight: true, contribution: true, explanation: true, sourceType: true, createdAt: true } },
};

async function ownedRiskContext(userId, requestId) {
  const request = await getDatabase().request.findFirst({
    where: { id: requestId, userId },
    include: { executionPlan: { include: { actions: { orderBy: { position: "asc" } }, simulationRun: { include: { effects: true, riskAssessment: { select: safeRiskSelect } } } } } },
  });
  if (!request) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  if (!request.executionPlan?.simulationRun || request.executionPlan.simulationRun.status !== "COMPLETED") throw new AppError(409, "SIMULATION_REQUIRED", "A completed Shadow simulation is required before risk evaluation");
  return { request, plan: request.executionPlan, simulation: request.executionPlan.simulationRun };
}

export async function getOwnedRisk(userId, requestId) {
  const context = await ownedRiskContext(userId, requestId);
  if (!context.simulation.riskAssessment) throw new AppError(404, "RISK_ASSESSMENT_NOT_FOUND", "Risk assessment not found");
  return context.simulation.riskAssessment;
}

export async function evaluateOwnedRisk(userId, requestId) {
  const context = await ownedRiskContext(userId, requestId);
  if (context.simulation.riskAssessment) return context.simulation.riskAssessment;
  const parsed = riskAssessmentCandidateSchema.safeParse(calculateRisk(context));
  if (!parsed.success) throw new AppError(422, "INVALID_RISK_INPUT", "Risk engine output failed structural validation");
  return getDatabase().$transaction((transaction) => transaction.riskAssessment.create({
    data: { simulationRunId: context.simulation.id, score: parsed.data.score, level: parsed.data.level, summary: parsed.data.summary, factors: { create: parsed.data.factors } },
    select: safeRiskSelect,
  }));
}

export { safeRiskSelect };
