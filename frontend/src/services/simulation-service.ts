import type { SimulationRun } from "../types/simulation";
import { apiRequest } from "./api-client";

export function runSimulation(requestId: string) {
  return apiRequest<{ simulation: SimulationRun }>(`/api/requests/${encodeURIComponent(requestId)}/simulation`, { method: "POST" })
    .then((payload) => payload.simulation);
}

export function getSimulation(requestId: string) {
  return apiRequest<{ simulation: SimulationRun }>(`/api/requests/${encodeURIComponent(requestId)}/simulation`)
    .then((payload) => payload.simulation);
}
