import { environment } from "../../config/environment.js";
import { sessionDurationMilliseconds } from "./token.js";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: sessionDurationMilliseconds(),
    path: "/",
    sameSite: "lax",
    secure: environment.nodeEnv === "production",
  };
}

export function clearSessionCookieOptions() {
  const { httpOnly, path, sameSite, secure } = sessionCookieOptions();
  return { httpOnly, path, sameSite, secure };
}
