import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { app } from "../src/app.js";
import { disconnectDatabase, getDatabase } from "../src/config/database.js";
import { environment } from "../src/config/environment.js";
import { createPendingManagerRequest } from "../src/services/auth/authService.js";
import { assertAuthConfiguration } from "../src/utils/auth/token.js";

const prefix = "phase2e-";
const seededUsers = {
  ADMIN: "admin@shadowos.dev",
  MANAGER: "manager@shadowos.dev",
  EMPLOYEE: "employee@shadowos.dev",
};
const browserOrigin = "http://localhost:3000";

let baseUrl;
let server;
let adminCookie;

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

function cookieFrom(response) {
  const cookie = response.headers.get("set-cookie");
  assert.ok(cookie);
  assert.match(cookie, /HttpOnly/i);
  return cookie.split(";", 1)[0];
}

async function login(email) {
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: environment.seedDemoPassword }),
  });
  assert.equal(result.response.status, 200);
  return cookieFrom(result.response);
}

async function logout(cookie) {
  const result = await request("/api/auth/logout", { method: "POST", headers: { cookie } });
  assert.equal(result.response.status, 200);
  const clearedCookie = result.response.headers.get("set-cookie");
  assert.ok(clearedCookie);
  assert.match(clearedCookie, /Expires=Thu, 01 Jan 1970|Max-Age=0/i);
  const session = await request("/api/auth/me");
  assert.equal(session.response.status, 401);
}

async function register(requestedRole) {
  const email = `${prefix}${randomUUID()}@shadowos.dev`;
  const password = `Aa1!${randomUUID()}z`;
  const result = await request("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", origin: browserOrigin },
    body: JSON.stringify({
      name: `Phase 2E ${requestedRole}`,
      email,
      password,
      requestedRole,
    }),
  });
  assert.equal(result.response.headers.get("access-control-allow-origin"), browserOrigin);
  return { ...result, email, cookie: cookieFrom(result.response) };
}

async function cleanup() {
  await getDatabase().user.deleteMany({ where: { email: { startsWith: prefix } } });
}

before(async () => {
  assertAuthConfiguration();
  if (!environment.seedDemoPassword || environment.seedDemoPassword.length < 12) {
    throw new Error("SEED_DEMO_PASSWORD must be configured with at least 12 characters");
  }
  await getDatabase().$connect();
  await cleanup();
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
  adminCookie = await login(seededUsers.ADMIN);
});

after(async () => {
  await cleanup();
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
});

test("EMPLOYEE registration is active immediately without a role request", async () => {
  const registration = await register("EMPLOYEE");
  assert.equal(registration.response.status, 201);
  assert.equal(registration.body.user.role, "EMPLOYEE");
  assert.equal(registration.body.user.status, "ACTIVE");
  assert.equal(registration.body.user.roleRequest, null);
  const session = await request("/api/auth/me", { headers: { cookie: registration.cookie } });
  assert.equal(session.response.status, 200);
  assert.equal(session.body.user.role, "EMPLOYEE");
  assert.equal(session.body.user.roleRequest, null);
  const user = await getDatabase().user.findUniqueOrThrow({
    where: { email: registration.email },
    include: { submittedRoleRequests: true },
  });
  assert.equal(user.submittedRoleRequests.length, 0);
  await logout(registration.cookie);
});

test("MANAGER registration creates a pending request without granting privileges", async (context) => {
  const registration = await register("MANAGER");
  assert.equal(registration.response.status, 201);
  assert.equal(registration.body.user.role, "EMPLOYEE");
  assert.deepEqual(registration.body.user.roleRequest, { requestedRole: "MANAGER", status: "PENDING" });
  const session = await request("/api/auth/me", { headers: { cookie: registration.cookie } });
  assert.equal(session.response.status, 200);
  assert.equal(session.body.user.role, "EMPLOYEE");
  assert.deepEqual(session.body.user.roleRequest, { requestedRole: "MANAGER", status: "PENDING" });
  const managerRoute = await request("/api/rbac/manager", { headers: { cookie: registration.cookie } });
  assert.equal(managerRoute.response.status, 403);
  await logout(registration.cookie);
  context.diagnostic("pending manager applicant remains EMPLOYEE");
});

test("duplicate registration returns a safe conflict", async () => {
  const registration = await register("EMPLOYEE");
  const duplicate = await request("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", origin: browserOrigin },
    body: JSON.stringify({
      name: "Duplicate Phase 2E",
      email: registration.email,
      password: `Aa1!${randomUUID()}z`,
      requestedRole: "EMPLOYEE",
    }),
  });
  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.body.error.code, "AUTH_EMAIL_EXISTS");
  await logout(registration.cookie);
});

test("public registration rejects ADMIN and raw role injection", async () => {
  for (const injected of [{ requestedRole: "ADMIN" }, { requestedRole: "EMPLOYEE", role: "ADMIN" }]) {
    const email = `${prefix}${randomUUID()}@shadowos.dev`;
    const result = await request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Injection Test", email, password: environment.seedDemoPassword, ...injected }),
    });
    assert.equal(result.response.status, 400);
    assert.equal(await getDatabase().user.findUnique({ where: { email } }), null);
  }
});

test("only ADMIN can list pending role requests", async () => {
  const managerCookie = await login(seededUsers.MANAGER);
  const employeeCookie = await login(seededUsers.EMPLOYEE);
  for (const [cookie, expected] of [[adminCookie, 200], [managerCookie, 403], [employeeCookie, 403], [undefined, 401]]) {
    const result = await request("/api/role-requests?status=PENDING", {
      headers: cookie ? { cookie } : {},
    });
    assert.equal(result.response.status, expected);
    if (expected === 200) assert.ok(Array.isArray(result.body.roleRequests));
  }
});

test("ADMIN approval updates the request and current database role for the existing session", async () => {
  const registration = await register("MANAGER");
  const roleRequest = await getDatabase().roleRequest.findFirstOrThrow({ where: { user: { email: registration.email } } });
  const before = await request("/api/rbac/manager", { headers: { cookie: registration.cookie } });
  assert.equal(before.response.status, 403);

  const approval = await request(`/api/role-requests/${roleRequest.id}/approve`, {
    method: "POST",
    headers: { cookie: adminCookie },
  });
  assert.equal(approval.response.status, 200);
  assert.equal(approval.body.roleRequest.status, "APPROVED");
  assert.equal(approval.body.roleRequest.user.role, "MANAGER");
  assert.ok(approval.body.roleRequest.reviewedBy?.id);
  assert.ok(approval.body.roleRequest.reviewedAt);

  const me = await request("/api/auth/me", { headers: { cookie: registration.cookie } });
  assert.equal(me.body.user.role, "MANAGER");
  assert.equal(me.body.user.roleRequest, null);
  const after = await request("/api/rbac/manager", { headers: { cookie: registration.cookie } });
  assert.equal(after.response.status, 200);

  const repeated = await request(`/api/role-requests/${roleRequest.id}/approve`, {
    method: "POST",
    headers: { cookie: adminCookie },
  });
  assert.equal(repeated.response.status, 409);
});

test("ADMIN rejection preserves EMPLOYEE role and review history", async () => {
  const registration = await register("MANAGER");
  const roleRequest = await getDatabase().roleRequest.findFirstOrThrow({ where: { user: { email: registration.email } } });
  const rejection = await request(`/api/role-requests/${roleRequest.id}/reject`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ comment: "Access requirements not yet met" }),
  });
  assert.equal(rejection.response.status, 200);
  assert.equal(rejection.body.roleRequest.status, "REJECTED");
  assert.equal(rejection.body.roleRequest.user.role, "EMPLOYEE");
  assert.ok(rejection.body.roleRequest.reviewedBy?.id);
  assert.ok(rejection.body.roleRequest.reviewedAt);
});

test("duplicate pending Manager requests are blocked in application logic", async () => {
  const registration = await register("MANAGER");
  const user = await getDatabase().user.findUniqueOrThrow({ where: { email: registration.email } });
  await assert.rejects(
    () => createPendingManagerRequest(getDatabase(), user.id),
    (error) => error?.code === "ROLE_REQUEST_PENDING" && error?.statusCode === 409,
  );
  assert.equal(
    await getDatabase().roleRequest.count({ where: { userId: user.id, status: "PENDING" } }),
    1,
  );
});

test("automated-test data is removed and seeded identities remain unchanged", async () => {
  await cleanup();
  for (const [role, email] of Object.entries(seededUsers)) {
    const user = await getDatabase().user.findUniqueOrThrow({ where: { email }, select: { role: true } });
    assert.equal(user.role, role);
  }
  assert.equal(await getDatabase().user.count({ where: { email: { startsWith: prefix } } }), 0);
  assert.equal(await getDatabase().roleRequest.count({ where: { user: { email: { startsWith: prefix } } } }), 0);
});
