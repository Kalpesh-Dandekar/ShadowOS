import type { RiskAssessment } from "../types/risk";
import { apiRequest } from "./api-client";

export function evaluateRisk(requestId: string) {
  return apiRequest<{ riskAssessment: RiskAssessment }>(`/api/requests/${encodeURIComponent(requestId)}/risk`, { method: "POST" })
    .then((payload) => payload.riskAssessment);
}

export function getRisk(requestId: string) {
  return apiRequest<{ riskAssessment: RiskAssessment }>(`/api/requests/${encodeURIComponent(requestId)}/risk`)
    .then((payload) => payload.riskAssessment);
}
