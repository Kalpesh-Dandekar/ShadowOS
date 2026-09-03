import type { ExecutionPlan } from "../types/plan";
import { apiRequest } from "./api-client";

export function generatePlan(requestId: string) {
  return apiRequest<{ plan: ExecutionPlan }>(`/api/requests/${encodeURIComponent(requestId)}/plan`, { method: "POST" })
    .then((payload) => payload.plan);
}

export function getPlan(requestId: string) {
  return apiRequest<{ plan: ExecutionPlan }>(`/api/requests/${encodeURIComponent(requestId)}/plan`)
    .then((payload) => payload.plan);
}
