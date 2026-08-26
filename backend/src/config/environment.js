import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
  quiet: true,
});

export const environment = Object.freeze({
  apiPort: Number(process.env.API_PORT ?? 4000),
  cookieName: process.env.COOKIE_NAME?.trim() || "shadowos_session",
  databaseUrl: process.env.DATABASE_URL,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "1d",
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV ?? "development",
  seedDemoPassword: process.env.SEED_DEMO_PASSWORD,
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
});
