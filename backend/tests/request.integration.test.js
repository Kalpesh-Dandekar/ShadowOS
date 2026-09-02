import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { app } from "../src/app.js";
import { disconnectDatabase, getDatabase } from "../src/config/database.js";
import { hashPassword } from "../src/utils/auth/password.js";
import { assertAuthConfiguration } from "../src/utils/auth/token.js";

const prefix = "phase3a-";
const password = `Aa1!${randomUUID()}z`;
const identities = Object.fromEntries(
  ["EMPLOYEE", "MANAGER", "ADMIN", "EMPTY"].map((role) => [role, `${prefix}${role.toLowerCase()}-${randomUUID()}@shadowos.dev`]),
);
const cookies = {};
const created = {};
let baseUrl;
let server;

function assertSafeBody(body) {
  const serialized = JSON.stringify(body);
  for (const forbidden of ["passwordHash", "DATABASE_URL", "JWT_SECRET", "stack"]) {
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
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: identities[role], password }),
  });
  assert.equal(result.response.status, 200);
  const cookie = result.response.headers.get("set-cookie");
  assert.ok(cookie);
  return cookie.split(";", 1)[0];
}

async function create(role, suffix) {
  const result = await request("/api/requests", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookies[role] },
    body: JSON.stringify({ prompt: `[phase3a] ${role} ${suffix} operational request`, environment: "PRODUCTION" }),
  });
  return result;
}

async function cleanup() {
  await getDatabase().user.deleteMany({ where: { email: { startsWith: prefix } } });
}

before(async () => {
  assertAuthConfiguration();
  await getDatabase().$connect();
  await cleanup();
  const passwordHash = await hashPassword(password);
  await getDatabase().user.createMany({
    data: [
      { name: "Phase 3A Employee", email: identities.EMPLOYEE, passwordHash, role: "EMPLOYEE", status: "ACTIVE" },
      { name: "Phase 3A Manager", email: identities.MANAGER, passwordHash, role: "MANAGER", status: "ACTIVE" },
      { name: "Phase 3A Admin", email: identities.ADMIN, passwordHash, role: "ADMIN", status: "ACTIVE" },
      { name: "Phase 3A Empty", email: identities.EMPTY, passwordHash, role: "EMPLOYEE", status: "ACTIVE" },
    ],
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
  for (const role of Object.keys(identities)) cookies[role] = await login(role);
});

after(async () => {
  await cleanup();
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
});

test("unauthenticated request creation returns 401", async () => {
  const result = await request("/api/requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "A valid unauthenticated request", environment: "PRODUCTION" }),
  });
  assert.equal(result.response.status, 401);
});

for (const role of ["EMPLOYEE", "MANAGER", "ADMIN"]) {
  test(`${role} can create a persisted SUBMITTED request`, async () => {
    const result = await create(role, "create");
    assert.equal(result.response.status, 201);
    assert.equal(result.body.request.status, "SUBMITTED");
    assert.equal(result.body.request.environment, "PRODUCTION");
    assert.equal(Object.hasOwn(result.body.request, "userId"), false);
    assert.match(result.body.request.id, /^[0-9a-f-]{36}$/i);
    assert.ok(result.body.request.createdAt);
    created[role] = result.body.request;
  });
}

test("strict input validation rejects invalid and server-controlled fields", async () => {
  const bodies = [
    { prompt: "", environment: "PRODUCTION" },
    { prompt: "A sufficiently long request", environment: "SANDBOX" },
    { prompt: "A sufficiently long request", environment: "PRODUCTION", userId: randomUUID() },
    { prompt: "A sufficiently long request", environment: "PRODUCTION", status: "PLANNED" },
  ];
  for (const body of bodies) {
    const result = await request("/api/requests", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookies.EMPLOYEE },
      body: JSON.stringify(body),
    });
    assert.equal(result.response.status, 400);
  }
});

test("an empty user list is paginated and empty", async () => {
  const result = await request("/api/requests?page=1&limit=20", { headers: { cookie: cookies.EMPTY } });
  assert.equal(result.response.status, 200);
  assert.deepEqual(result.body.requests, []);
  assert.deepEqual(result.body.pagination, { page: 1, limit: 20, total: 0, totalPages: 0 });
});

test("list returns only the authenticated user's requests", async () => {
  const result = await request("/api/requests", { headers: { cookie: cookies.EMPLOYEE } });
  assert.equal(result.response.status, 200);
  assert.ok(result.body.requests.some((item) => item.id === created.EMPLOYEE.id));
  assert.equal(result.body.requests.some((item) => item.id === created.ADMIN.id), false);
});

test("owner can retrieve a request and another user receives 404", async () => {
  const owned = await request(`/api/requests/${created.EMPLOYEE.id}`, { headers: { cookie: cookies.EMPLOYEE } });
  assert.equal(owned.response.status, 200);
  assert.equal(owned.body.request.id, created.EMPLOYEE.id);

  const hidden = await request(`/api/requests/${created.EMPLOYEE.id}`, { headers: { cookie: cookies.MANAGER } });
  assert.equal(hidden.response.status, 404);
  assert.equal(hidden.body.error.code, "REQUEST_NOT_FOUND");
});

test("page pagination is bounded and newest first", async () => {
  for (const suffix of ["pagination one", "pagination two", "pagination three"]) await create("EMPLOYEE", suffix);
  const first = await request("/api/requests?page=1&limit=2", { headers: { cookie: cookies.EMPLOYEE } });
  const second = await request("/api/requests?page=2&limit=2", { headers: { cookie: cookies.EMPLOYEE } });
  assert.equal(first.response.status, 200);
  assert.equal(first.body.requests.length, 2);
  assert.equal(second.body.requests.length, 2);
  assert.equal(first.body.pagination.total, 4);
  const combined = [...first.body.requests, ...second.body.requests];
  for (let index = 1; index < combined.length; index += 1) {
    assert.ok(new Date(combined[index - 1].createdAt) >= new Date(combined[index].createdAt));
  }

  for (const query of ["page=0&limit=20", "page=1&limit=101"]) {
    const invalid = await request(`/api/requests?${query}`, { headers: { cookie: cookies.EMPLOYEE } });
    assert.equal(invalid.response.status, 400);
  }
});

test("temporary request identities and their requests are removed", async () => {
  await cleanup();
  assert.equal(await getDatabase().user.count({ where: { email: { startsWith: prefix } } }), 0);
  assert.equal(await getDatabase().request.count({ where: { prompt: { startsWith: "[phase3a]" } } }), 0);
});
