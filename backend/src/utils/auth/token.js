import jwt from "jsonwebtoken";

import { environment } from "../../config/environment.js";

const durationPattern = /^(\d+)([smhd])$/i;
const durationMultipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

export function assertAuthConfiguration() {
  if (!environment.jwtSecret?.trim() || environment.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  if (!durationPattern.test(environment.jwtExpiresIn)) {
    throw new Error("JWT_EXPIRES_IN must use a duration such as 15m, 12h, or 1d");
  }
}

export function createSessionToken(user) {
  assertAuthConfiguration();
  return jwt.sign({ role: user.role }, environment.jwtSecret, {
    subject: user.id,
    expiresIn: environment.jwtExpiresIn,
  });
}

export function verifySessionToken(token) {
  assertAuthConfiguration();
  const payload = jwt.verify(token, environment.jwtSecret);
  if (typeof payload !== "object" || typeof payload.sub !== "string") {
    throw new Error("Invalid session payload");
  }
  return payload;
}

export function sessionDurationMilliseconds() {
  const match = environment.jwtExpiresIn.match(durationPattern);
  if (!match) throw new Error("JWT_EXPIRES_IN is invalid");
  return Number(match[1]) * durationMultipliers[match[2].toLowerCase()];
}
