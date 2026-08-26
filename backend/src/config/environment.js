import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
  quiet: true,
});

export const environment = Object.freeze({
  apiPort: Number(process.env.API_PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
});
