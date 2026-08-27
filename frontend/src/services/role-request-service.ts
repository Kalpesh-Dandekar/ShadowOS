import type { RoleRequest } from "../types/role-request";
import { apiRequest } from "./api-client";

export async function listPendingRoleRequests() {
  return (await apiRequest<{ roleRequests: RoleRequest[] }>("/api/role-requests?status=PENDING")).roleRequests;
}

export async function approveRoleRequest(id: string) {
  return (await apiRequest<{ roleRequest: RoleRequest }>(`/api/role-requests/${id}/approve`, { method: "POST" })).roleRequest;
}

export async function rejectRoleRequest(id: string, comment?: string) {
  return (await apiRequest<{ roleRequest: RoleRequest }>(`/api/role-requests/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(comment ? { comment } : {}),
  })).roleRequest;
}
