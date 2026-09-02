import type { RequestEnvironment, RequestPagination, ShadowRequest } from "../types/request";
import { apiRequest } from "./api-client";

export function createRequest(input: { prompt: string; environment: RequestEnvironment }) {
  return apiRequest<{ request: ShadowRequest }>("/api/requests", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((payload) => payload.request);
}

export function listRequests(page = 1, limit = 20) {
  return apiRequest<{ requests: ShadowRequest[]; pagination: RequestPagination }>(
    `/api/requests?page=${page}&limit=${limit}`,
  );
}

export function getRequest(id: string) {
  return apiRequest<{ request: ShadowRequest }>(`/api/requests/${encodeURIComponent(id)}`)
    .then((payload) => payload.request);
}
