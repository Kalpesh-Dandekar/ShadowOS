import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { environment } from "./config/environment.js";
import { assertAuthConfiguration } from "./utils/auth/token.js";

let server;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down ShadowOS API`);

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await disconnectDatabase();
}

async function startServer() {
  assertAuthConfiguration();
  await connectDatabase();
  server = app.listen(environment.apiPort, () => {
    console.log(`ShadowOS API listening on port ${environment.apiPort}`);
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    shutdown(signal)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("ShadowOS API shutdown failed", error);
        process.exit(1);
      });
  });
}

startServer().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown database error";
  console.error(`ShadowOS API failed to start: ${message}`);
  disconnectDatabase().finally(() => process.exit(1));
});
