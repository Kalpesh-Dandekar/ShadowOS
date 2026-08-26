import { environment } from "../config/environment.js";
import { loginUser, registerUser } from "../services/auth/authService.js";
import { clearSessionCookieOptions, sessionCookieOptions } from "../utils/auth/cookie.js";
import { createSessionToken } from "../utils/auth/token.js";

function establishSession(response, user) {
  response.cookie(environment.cookieName, createSessionToken(user), sessionCookieOptions());
}

export async function register(request, response) {
  const user = await registerUser(request.validatedBody);
  establishSession(response, user);
  response.status(201).json({ user });
}

export async function login(request, response) {
  const user = await loginUser(request.validatedBody);
  establishSession(response, user);
  response.json({ user });
}

export function logout(_request, response) {
  response.clearCookie(environment.cookieName, clearSessionCookieOptions());
  response.json({ success: true });
}

export function me(request, response) {
  response.json({ user: request.user });
}
