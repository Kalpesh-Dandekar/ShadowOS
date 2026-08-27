import type { AuthUser, LoginInput, RegisterInput } from "../types/auth";
import { apiRequest } from "./api-client";

export { ApiError } from "./api-client";

export async function login(input: LoginInput) {
  return (await apiRequest<{ user: AuthUser }>("/api/auth/login", { method: "POST", body: JSON.stringify(input) })).user;
}

export async function register(input: RegisterInput) {
  return (await apiRequest<{ user: AuthUser }>("/api/auth/register", { method: "POST", body: JSON.stringify(input) })).user;
}

export async function logout() {
  await apiRequest<{ success: true }>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser() {
  return (await apiRequest<{ user: AuthUser }>("/api/auth/me")).user;
}
