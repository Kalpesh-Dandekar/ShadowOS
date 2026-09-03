import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { app } from "../src/app.js";
import { disconnectDatabase, getDatabase } from "../src/config/database.js";
import { simulationCandidateSchema } from "../src/schemas/simulationSchemas.js";
import { syntheticDataset } from "../src/services/simulation/syntheticDataset.js";
import { SyntheticSimulationProvider } from "../src/services/simulation/syntheticSimulationProvider.js";
import { hashPassword } from "../src/utils/auth/password.js";
import { assertAuthConfiguration } from "../src/utils/auth/token.js";

const prefix = "phase4-";
const marker = "[phase4]";
const password = `Aa1!${randomUUID()}z`;
const identities = Object.fromEntries(["EMPLOYEE", "MANAGER", "ADMIN", "OTHER", "NOPLAN"].map((role) => [role, `${prefix}${role.toLowerCase()}-${randomUUID()}@shadowos.dev`]));
const cookies = {};
const contexts = {};
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

async function createPlannedRequest(role, prompt) {
  const created = await api("/api/requests", { method: "POST", headers: { "content-type": "application/json", cookie: cookies[role] }, body: JSON.stringify({ prompt: `${marker} ${prompt}`, environment: "PRODUCTION" }) });
  assert.equal(created.response.status, 201);
  const planned = await api(`/api/requests/${created.body.request.id}/plan`, { method: "POST", headers: { cookie: cookies[role] } });
  assert.equal(planned.response.status, 201);
  return { request: created.body.request, plan: planned.body.plan };
}

function simulate(role, requestId, body) {
  return api(`/api/requests/${requestId}/simulation`, { method: "POST", headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), cookie: cookies[role] }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

async function cleanup() { await getDatabase().user.deleteMany({ where: { email: { startsWith: prefix } } }); }

before(async () => {
  assertAuthConfiguration();
  await getDatabase().$connect();
  await cleanup();
  const passwordHash = await hashPassword(password);
  await getDatabase().user.createMany({ data: Object.entries(identities).map(([role, email]) => ({ name: `Phase 4 ${role}`, email, passwordHash, role: ["MANAGER", "ADMIN"].includes(role) ? role : "EMPLOYEE", status: "ACTIVE" })) });
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

test("unauthenticated simulation returns 401", async () => {
  const context = await createPlannedRequest("EMPLOYEE", "Delete archived invoices older than January 2024");
  const result = await api(`/api/requests/${context.request.id}/simulation`, { method: "POST" });
  assert.equal(result.response.status, 401);
});

test("request without a plan fails safely", async () => {
  const created = await api("/api/requests", { method: "POST", headers: { "content-type": "application/json", cookie: cookies.NOPLAN }, body: JSON.stringify({ prompt: `${marker} Delete archived invoices older than January 2024`, environment: "PRODUCTION" }) });
  const result = await simulate("NOPLAN", created.body.request.id);
  assert.equal(result.response.status, 409);
  assert.equal(result.body.error.code, "PLAN_REQUIRED");
});

for (const role of ["EMPLOYEE", "MANAGER", "ADMIN"]) {
  test(`${role} can simulate its own plan`, async () => {
    const context = await createPlannedRequest(role, "Delete archived invoices older than January 2024");
    const result = await simulate(role, context.request.id);
    assert.equal(result.response.status, 201);
    assert.equal(result.body.simulation.provider, "SYNTHETIC");
    assert.equal(result.body.simulation.status, "COMPLETED");
    contexts[role] = { ...context, simulation: result.body.simulation };
  });
}

test("invoice deletion derives deterministic matches and projected deletions", () => {
  const simulation = contexts.EMPLOYEE.simulation;
  assert.equal(simulation.totalResourcesExamined, syntheticDataset.INVOICE.length);
  assert.equal(simulation.matchedResources, 3);
  assert.equal(simulation.affectedResources, 3);
  assert.equal(simulation.dependencyObservations, 2);
  assert.equal(simulation.effects.every((effect) => effect.effectType === "DELETE_RESOURCE" && effect.changed), true);
  assert.equal(simulation.effects.every((effect) => effect.afterState.deleted === true), true);
});

test("account archival projects reversible before and after states", async () => {
  const context = await createPlannedRequest("OTHER", "Archive inactive customer accounts older than 2 years");
  const result = await simulate("OTHER", context.request.id);
  assert.equal(result.response.status, 201);
  assert.equal(result.body.simulation.totalResourcesExamined, syntheticDataset.CUSTOMER_ACCOUNT.length);
  assert.equal(result.body.simulation.matchedResources, 2);
  assert.equal(result.body.simulation.affectedResources, 2);
  assert.equal(result.body.simulation.effects.every((effect) => effect.beforeState.archived === false && effect.afterState.archived === true && effect.afterState.status === "archived"), true);
  contexts.OTHER = { ...context, simulation: result.body.simulation };
});

test("query and validation actions do not count as projected mutations", () => {
  const simulation = contexts.ADMIN.simulation;
  assert.equal(simulation.effects.every((effect) => effect.planActionId === contexts.ADMIN.plan.actions[2].id), true);
  assert.equal(simulation.affectedResources, simulation.effects.length);
});

test("provider is deterministic and its output passes strict validation", () => {
  const provider = new SyntheticSimulationProvider();
  const first = provider.simulate(contexts.EMPLOYEE.plan);
  const second = provider.simulate(contexts.EMPLOYEE.plan);
  assert.deepEqual(first, second);
  assert.equal(simulationCandidateSchema.safeParse(first).success, true);
  assert.equal(simulationCandidateSchema.safeParse({ ...first, unexpected: true }).success, false);
});

test("repeated simulation returns the existing run without duplicate effects", async () => {
  const result = await simulate("MANAGER", contexts.MANAGER.request.id);
  assert.equal(result.response.status, 201);
  assert.equal(result.body.simulation.id, contexts.MANAGER.simulation.id);
  assert.equal(await getDatabase().simulationRun.count({ where: { planId: contexts.MANAGER.plan.id } }), 1);
  assert.equal(await getDatabase().simulationEffect.count({ where: { simulationRunId: contexts.MANAGER.simulation.id } }), 3);
});

test("cross-user simulation and read are concealed", async () => {
  const run = await simulate("OTHER", contexts.EMPLOYEE.request.id);
  assert.equal(run.response.status, 404);
  assert.equal(run.body.error.code, "REQUEST_NOT_FOUND");
  const read = await api(`/api/requests/${contexts.EMPLOYEE.request.id}/simulation`, { headers: { cookie: cookies.OTHER } });
  assert.equal(read.response.status, 404);
  assert.equal(read.body.error.code, "REQUEST_NOT_FOUND");
});

test("owner can read the persisted simulation", async () => {
  const result = await api(`/api/requests/${contexts.EMPLOYEE.request.id}/simulation`, { headers: { cookie: cookies.EMPLOYEE } });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.simulation.id, contexts.EMPLOYEE.simulation.id);
});

test("client cannot inject simulation output", async () => {
  const context = await createPlannedRequest("NOPLAN", "Delete archived invoices older than January 2024");
  for (const body of [{ affectedResources: 99 }, { provider: "SYNTHETIC" }, { effects: [] }, { status: "COMPLETED" }]) {
    const result = await simulate("NOPLAN", context.request.id, body);
    assert.equal(result.response.status, 400);
  }
  assert.equal(await getDatabase().simulationRun.count({ where: { planId: context.plan.id } }), 0);
});

test("unsupported simulation action fails without a partial run", async () => {
  const user = await getDatabase().user.findUnique({ where: { email: identities.NOPLAN } });
  const request = await getDatabase().request.create({ data: { userId: user.id, prompt: `${marker} Create a customer account`, environment: "PRODUCTION", status: "PLANNED" } });
  const plan = await getDatabase().executionPlan.create({ data: { requestId: request.id, provider: "SIMULATION", summary: "Unsupported fixture", status: "GENERATED", actions: { create: [{ position: 1, type: "VALIDATE_SCOPE", resourceType: "CUSTOMER_ACCOUNT", description: "Validate", target: { definition: "validated_request_fields" }, destructive: false, reversible: true, reason: "Test" }, { position: 2, type: "CREATE_RESOURCE", resourceType: "CUSTOMER_ACCOUNT", description: "Create", target: { definition: "validated_request_fields" }, destructive: false, reversible: true, reason: "Test" }] } } });
  const result = await simulate("NOPLAN", request.id);
  assert.equal(result.response.status, 422);
  assert.equal(result.body.error.code, "UNSUPPORTED_SIMULATION_ACTION");
  assert.equal(await getDatabase().simulationRun.count({ where: { planId: plan.id } }), 0);
});

test("synthetic source resources are never mutated", () => {
  assert.equal(Object.isFrozen(syntheticDataset.INVOICE), true);
  assert.equal(Object.isFrozen(syntheticDataset.CUSTOMER_ACCOUNT), true);
  assert.equal(syntheticDataset.INVOICE[0].status, "archived");
  assert.equal(syntheticDataset.CUSTOMER_ACCOUNT[0].archived, false);
});

test("temporary simulation data is removed without touching manual plans", async () => {
  await cleanup();
  assert.equal(await getDatabase().user.count({ where: { email: { startsWith: prefix } } }), 0);
  assert.equal(await getDatabase().request.count({ where: { prompt: { startsWith: marker } } }), 0);
});
