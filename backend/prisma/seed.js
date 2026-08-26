import bcrypt from "bcrypt";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";

import { disconnectDatabase, getDatabase } from "../src/config/database.js";
import { BCRYPT_COST } from "../src/utils/auth/password.js";

config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
});

const demoPassword = process.env.SEED_DEMO_PASSWORD;

if (!demoPassword || demoPassword.length < 12) {
  throw new Error("SEED_DEMO_PASSWORD must be configured with at least 12 characters");
}

const users = [
  { name: "Kalpesh Dandekar", email: "admin@shadowos.dev", role: "ADMIN" },
  { name: "Demo Manager", email: "manager@shadowos.dev", role: "MANAGER" },
  { name: "Demo Employee", email: "employee@shadowos.dev", role: "EMPLOYEE" },
];

const database = getDatabase();

try {
  const passwordHash = await bcrypt.hash(demoPassword, BCRYPT_COST);
  for (const user of users) {
    await database.user.upsert({
      where: { email: user.email },
      update: { name: user.name, passwordHash, role: user.role, status: "ACTIVE" },
      create: { ...user, passwordHash, status: "ACTIVE" },
    });
  }
  console.log(`ShadowOS development identities synchronized: ${users.length}`);
} finally {
  await disconnectDatabase();
}
