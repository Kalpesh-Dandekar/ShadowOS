import type { AuthUser, LoginInput, RegisterInput } from "../types/auth";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

type ErrorPayload = { error?: { code?: string; message?: string; details?: unknown } };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: { ...(init?.body ? { "content-type": "application/json" } : {}), ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Unable to reach ShadowOS. Check that the API is running.");
  }

  const payload = (await response.json().catch(() => ({}))) as T & ErrorPayload;
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error?.code || "REQUEST_FAILED",
      payload.error?.message || "The request could not be completed.",
      payload.error?.details,
    );
  }
  return payload;
}

export async function login(input: LoginInput) {
  return (await request<{ user: AuthUser }>("/api/auth/login", { method: "POST", body: JSON.stringify(input) })).user;
}

export async function register(input: RegisterInput) {
  return (await request<{ user: AuthUser }>("/api/auth/register", { method: "POST", body: JSON.stringify(input) })).user;
}

export async function logout() {
  await request<{ success: true }>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser() {
  return (await request<{ user: AuthUser }>("/api/auth/me")).user;
}
