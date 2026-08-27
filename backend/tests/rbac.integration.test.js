import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { app } from "../src/app.js";
import { disconnectDatabase, getDatabase } from "../src/config/database.js";
import { environment } from "../src/config/environment.js";
import { authorize } from "../src/middleware/authorize.js";
import { assertAuthConfiguration } from "../src/utils/auth/token.js";

const users = {
  EMPLOYEE: "employee@shadowos.dev",
  MANAGER: "manager@shadowos.dev",
  ADMIN: "admin@shadowos.dev",
};
const paths = ["authenticated", "manager", "admin"];

let baseUrl;
let server;

function assertSafeBody(body) {
  const serialized = JSON.stringify(body);
  for (const forbidden of ["passwordHash", "stack", "DATABASE_URL", "JWT_SECRET"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  assertSafeBody(body);
  return { response, body };
}

async function login(role) {
  const { response } = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: users[role], password: environment.seedDemoPassword }),
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie");
  assert.ok(cookie);
  assert.match(cookie, /HttpOnly/i);
  return cookie.split(";", 1)[0];
}

async function assertMatrix(role, expected) {
  const cookie = await login(role);
  for (const [index, path] of paths.entries()) {
    const { response, body } = await request(`/api/rbac/${path}`, { headers: { cookie } });
    assert.equal(response.status, expected[index]);
    if (response.status === 200) assert.equal(body.role, role);
    if (response.status === 403) assert.equal(body.error?.code, "AUTH_FORBIDDEN");
  }
}

before(async () => {
  assertAuthConfiguration();
  if (!environment.seedDemoPassword || environment.seedDemoPassword.length < 12) {
    throw new Error("SEED_DEMO_PASSWORD must be configured with at least 12 characters");
  }
  await getDatabase().$connect();
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
});

test("EMPLOYEE permissions", () => assertMatrix("EMPLOYEE", [200, 403, 403]));
test("MANAGER permissions", () => assertMatrix("MANAGER", [200, 200, 403]));
test("ADMIN permissions", () => assertMatrix("ADMIN", [200, 200, 200]));

test("invalid authorization configuration fails immediately", () => {
  assert.throws(() => authorize(), TypeError);
  assert.throws(() => authorize("SUPERADMIN"), TypeError);
});

test("unauthenticated and invalid sessions receive 401", async () => {
  for (const path of paths) {
    for (const headers of [{}, { cookie: `${environment.cookieName}=invalid-session` }]) {
      const { response, body } = await request(`/api/rbac/${path}`, { headers });
      assert.equal(response.status, 401);
      assert.equal(body.error?.code, "AUTH_UNAUTHORIZED");
    }
  }
});

test("an existing session obeys the current database role", async () => {
  const database = getDatabase();
  const cookie = await login("MANAGER");
  try {
    await database.user.update({ where: { email: users.MANAGER }, data: { role: "EMPLOYEE" } });
    const { response } = await request("/api/rbac/manager", { headers: { cookie } });
    assert.equal(response.status, 403);
  } finally {
    await database.user.update({ where: { email: users.MANAGER }, data: { role: "MANAGER" } });
  }
  const restored = await database.user.findUnique({ where: { email: users.MANAGER } });
  assert.equal(restored.role, "MANAGER");
});

test("a disabled user is rejected by authentication before authorization", async () => {
  const database = getDatabase();
  const cookie = await login("EMPLOYEE");
  try {
    await database.user.update({ where: { email: users.EMPLOYEE }, data: { status: "DISABLED" } });
    const { response, body } = await request("/api/rbac/manager", { headers: { cookie } });
    assert.equal(response.status, 401);
    assert.equal(body.error?.code, "AUTH_UNAUTHORIZED");
  } finally {
    await database.user.update({ where: { email: users.EMPLOYEE }, data: { status: "ACTIVE" } });
  }
  const restored = await database.user.findUnique({ where: { email: users.EMPLOYEE } });
  assert.equal(restored.status, "ACTIVE");
});

test("public registration rejects role injection without creating a user", async () => {
  const database = getDatabase();
  const email = `rbac-${randomUUID()}@shadowos.dev`;
  const { response } = await request("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "RBAC Test", email, password: environment.seedDemoPassword, role: "ADMIN" }),
  });
  assert.equal(response.status, 400);
  assert.equal(await database.user.findUnique({ where: { email } }), null);
});

test("authentication and health routes remain operational", async () => {
  const cookie = await login("EMPLOYEE");
  const me = await request("/api/auth/me", { headers: { cookie } });
  assert.equal(me.response.status, 200);
  assert.equal(me.body.user.role, "EMPLOYEE");

  const logout = await request("/api/auth/logout", { method: "POST", headers: { cookie } });
  assert.equal(logout.response.status, 200);
  assert.ok(logout.response.headers.get("set-cookie"));

  const health = await request("/health");
  assert.equal(health.response.status, 200);
});

test("seeded identities retain their roles", async () => {
  const database = getDatabase();
  for (const [role, email] of Object.entries(users)) {
    const user = await database.user.findUniqueOrThrow({ where: { email }, select: { role: true } });
    assert.equal(user.role, role);
  }
});
