import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { app } from "../src/app.js";
import { disconnectDatabase, getDatabase } from "../src/config/database.js";
import { planCandidateSchema, PLAN_ACTION_TYPES } from "../src/schemas/planSchemas.js";
import { generateOwnedPlan } from "../src/services/planner/plannerService.js";
import { SimulationPlannerProvider } from "../src/services/planner/simulationPlannerProvider.js";
import { hashPassword } from "../src/utils/auth/password.js";
import { assertAuthConfiguration } from "../src/utils/auth/token.js";

const prefix = "phase3b-";
const marker = "[phase3b]";
const password = `Aa1!${randomUUID()}z`;
const identities = Object.fromEntries(["EMPLOYEE", "MANAGER", "ADMIN", "OTHER"].map((role) => [role, `${prefix}${role.toLowerCase()}-${randomUUID()}@shadowos.dev`]));
const cookies = {};
const requests = {};
let baseUrl;
let server;

function assertSafe(body) {
  const serialized = JSON.stringify(body);
  for (const forbidden of ["passwordHash", "DATABASE_URL", "JWT_SECRET", "stack"]) assert.equal(serialized.includes(forbidden), false);
}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  assertSafe(body);
  return { response, body };
}

async function login(role) {
  const result = await api("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: identities[role], password }) });
  assert.equal(result.response.status, 200);
  return result.response.headers.get("set-cookie").split(";", 1)[0];
}

async function createRequest(role, prompt) {
  const result = await api("/api/requests", { method: "POST", headers: { "content-type": "application/json", cookie: cookies[role] }, body: JSON.stringify({ prompt: `${marker} ${prompt}`, environment: "PRODUCTION" }) });
  assert.equal(result.response.status, 201);
  return result.body.request;
}

async function plan(role, requestId, body) {
  return api(`/api/requests/${requestId}/plan`, {
    method: "POST",
    headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), cookie: cookies[role] },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

async function cleanup() {
  await getDatabase().user.deleteMany({ where: { email: { startsWith: prefix } } });
}

before(async () => {
  assertAuthConfiguration();
  await getDatabase().$connect();
  await cleanup();
  const passwordHash = await hashPassword(password);
  await getDatabase().user.createMany({ data: Object.entries(identities).map(([role, email]) => ({ name: `Phase 3B ${role}`, email, passwordHash, role: role === "OTHER" ? "EMPLOYEE" : role, status: "ACTIVE" })) });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  for (const role of Object.keys(identities)) cookies[role] = await login(role);
});

after(async () => {
  await cleanup();
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
});

test("unauthenticated planning returns 401", async () => {
  const request = await createRequest("EMPLOYEE", "Delete archived invoices older than January 2024");
  const result = await api(`/api/requests/${request.id}/plan`, { method: "POST" });
  assert.equal(result.response.status, 401);
});

for (const role of ["EMPLOYEE", "MANAGER", "ADMIN"]) {
  test(`${role} can plan its own request`, async () => {
    const request = await createRequest(role, "Delete archived invoices older than January 2024");
    const result = await plan(role, request.id);
    assert.equal(result.response.status, 201);
    assert.equal(result.body.plan.provider, "SIMULATION");
    assert.equal(result.body.plan.actions.length, 3);
    requests[role] = { request, plan: result.body.plan };
  });
}

test("invoice deletion produces ordered allowlisted semantic actions", () => {
  const actions = requests.EMPLOYEE.plan.actions;
  assert.deepEqual(actions.map((item) => item.type), ["QUERY_RESOURCE", "VALIDATE_SCOPE", "DELETE_RESOURCE"]);
  assert.deepEqual(actions.map((item) => item.position), [1, 2, 3]);
  assert.equal(actions.at(-1).destructive, true);
  assert.equal(actions.at(-1).reversible, false);
  for (const action of actions) assert.ok(PLAN_ACTION_TYPES.includes(action.type));
});

test("account archival produces reversible ordered semantic actions", async () => {
  const request = await createRequest("OTHER", "Archive inactive customer accounts older than 2 years");
  const result = await plan("OTHER", request.id);
  assert.equal(result.response.status, 201);
  assert.deepEqual(result.body.plan.actions.map((item) => item.type), ["QUERY_RESOURCE", "VALIDATE_SCOPE", "ARCHIVE_RESOURCE"]);
  assert.equal(result.body.plan.actions.at(-1).resourceType, "CUSTOMER_ACCOUNT");
  assert.equal(result.body.plan.actions.at(-1).reversible, true);
});

test("provider output is deterministic and passes the strict candidate schema", () => {
  const provider = new SimulationPlannerProvider();
  const request = { prompt: "Delete archived invoices older than January 2024" };
  const first = provider.generatePlan(request);
  const second = provider.generatePlan(request);
  assert.deepEqual(first, second);
  assert.equal(planCandidateSchema.safeParse(first).success, true);
  assert.equal(planCandidateSchema.safeParse({ ...first, unexpected: true }).success, false);
});

test("request transitions through PLANNING before atomic PLANNED persistence", async () => {
  const request = await createRequest("OTHER", "Find customer accounts for review");
  const user = await getDatabase().user.findUnique({ where: { email: identities.OTHER } });
  let release;
  let providerStarted;
  const started = new Promise((resolve) => { providerStarted = resolve; });
  const provider = {
    type: "SIMULATION",
    async generatePlan() {
      providerStarted();
      await new Promise((resolve) => { release = resolve; });
      return new SimulationPlannerProvider().generatePlan({ prompt: "Find customer accounts for review" });
    },
  };
  const planning = generateOwnedPlan(user.id, request.id, provider);
  await started;
  assert.equal((await getDatabase().request.findUnique({ where: { id: request.id } })).status, "PLANNING");
  release();
  await planning;
  const stored = await getDatabase().request.findUnique({ where: { id: request.id }, include: { executionPlan: true } });
  assert.equal(stored.status, "PLANNED");
  assert.ok(stored.executionPlan);
});

test("successful planning persists an atomic PLANNED request and ordered actions", async () => {
  const storedRequest = await getDatabase().request.findUnique({ where: { id: requests.MANAGER.request.id }, include: { executionPlan: { include: { actions: { orderBy: { position: "asc" } } } } } });
  assert.equal(storedRequest.status, "PLANNED");
  assert.ok(storedRequest.executionPlan);
  assert.deepEqual(storedRequest.executionPlan.actions.map((item) => item.position), [1, 2, 3]);
});

test("repeated planning returns the existing plan without duplication", async () => {
  const repeated = await plan("ADMIN", requests.ADMIN.request.id);
  assert.equal(repeated.response.status, 201);
  assert.equal(repeated.body.plan.id, requests.ADMIN.plan.id);
  assert.equal(await getDatabase().executionPlan.count({ where: { requestId: requests.ADMIN.request.id } }), 1);
});

test("cross-user planning and reading are concealed", async () => {
  const generated = await plan("OTHER", requests.EMPLOYEE.request.id);
  assert.equal(generated.response.status, 404);
  assert.equal(generated.body.error.code, "REQUEST_NOT_FOUND");
  const read = await api(`/api/requests/${requests.EMPLOYEE.request.id}/plan`, { headers: { cookie: cookies.OTHER } });
  assert.equal(read.response.status, 404);
  assert.equal(read.body.error.code, "REQUEST_NOT_FOUND");
});

test("owner reads a persisted plan with actions sorted by position", async () => {
  const result = await api(`/api/requests/${requests.EMPLOYEE.request.id}/plan`, { headers: { cookie: cookies.EMPLOYEE } });
  assert.equal(result.response.status, 200);
  assert.deepEqual(result.body.plan.actions.map((item) => item.position), [1, 2, 3]);
});

test("unsupported intent fails safely without persisting a plan", async () => {
  const request = await createRequest("EMPLOYEE", "Do something weird with everything");
  const result = await plan("EMPLOYEE", request.id);
  assert.equal(result.response.status, 422);
  assert.equal(result.body.error.code, "UNSUPPORTED_PLANNING_INTENT");
  const stored = await getDatabase().request.findUnique({ where: { id: request.id }, include: { executionPlan: true } });
  assert.equal(stored.status, "FAILED");
  assert.equal(stored.executionPlan, null);
});

test("client cannot inject plan output fields", async () => {
  const request = await createRequest("EMPLOYEE", "Delete archived invoices older than January 2024");
  for (const body of [{ actions: [] }, { provider: "SIMULATION" }, { status: "GENERATED" }, { summary: "Injected" }]) {
    const result = await plan("EMPLOYEE", request.id, body);
    assert.equal(result.response.status, 400);
  }
  assert.equal((await getDatabase().request.findUnique({ where: { id: request.id } })).status, "SUBMITTED");
});

test("persisted actions contain no executable action vocabulary", async () => {
  const actions = await getDatabase().planAction.findMany({ where: { plan: { request: { user: { email: { startsWith: prefix } } } } } });
  const serialized = JSON.stringify(actions);
  for (const forbidden of ["RUN_SHELL", "EXECUTE_SQL", "RUN_SCRIPT", "TERMINAL_COMMAND", "HTTP_REQUEST", "ARBITRARY_COMMAND"]) assert.equal(serialized.includes(forbidden), false);
});

test("temporary planning data is removed without touching manual requests", async () => {
  await cleanup();
  assert.equal(await getDatabase().user.count({ where: { email: { startsWith: prefix } } }), 0);
  assert.equal(await getDatabase().request.count({ where: { prompt: { startsWith: marker } } }), 0);
});
