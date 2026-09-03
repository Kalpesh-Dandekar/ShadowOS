import type { PolicyEvaluation } from "../types/policy";
import { apiRequest } from "./api-client";

export function evaluatePolicy(requestId: string) { return apiRequest<{ policyEvaluation: PolicyEvaluation }>(`/api/requests/${encodeURIComponent(requestId)}/policy`, { method: "POST" }).then((payload) => payload.policyEvaluation); }
export function getPolicyEvaluation(requestId: string) { return apiRequest<{ policyEvaluation: PolicyEvaluation }>(`/api/requests/${encodeURIComponent(requestId)}/policy`).then((payload) => payload.policyEvaluation); }
