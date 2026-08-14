import "dotenv/config";

export const environment = Object.freeze({
  apiPort: Number(process.env.API_PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
});
