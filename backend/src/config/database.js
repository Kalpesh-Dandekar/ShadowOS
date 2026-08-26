import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { environment } from "./environment.js";

let database;

export function getDatabase() {
  if (!environment.databaseUrl) {
    throw new Error("DATABASE_URL is required to start the ShadowOS API");
  }

  if (!database) {
    const adapter = new PrismaPg({ connectionString: environment.databaseUrl });
    database = new PrismaClient({ adapter });
  }

  return database;
}

export async function connectDatabase() {
  await getDatabase().$connect();
}

export async function disconnectDatabase() {
  if (database) await database.$disconnect();
}
