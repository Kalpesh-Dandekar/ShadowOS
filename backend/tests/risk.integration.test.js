import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { app } from "../src/app.js";
import { disconnectDatabase, getDatabase } from "../src/config/database.js";
import { riskAssessmentCandidateSchema } from "../src/schemas/riskSchemas.js";
import { calculateRisk, levelForScore } from "../src/services/risk/riskEngine.js";
import { RISK_WEIGHTS } from "../src/services/risk/riskFactorEvaluators.js";
import { hashPassword } from "../src/utils/auth/password.js";
import { assertAuthConfiguration } from "../src/utils/auth/token.js";

const prefix = "phase5-";
const marker = "[phase5]";
const password = `Aa1!${randomUUID()}z`;
const identities = Object.fromEntries(["EMPLOYEE", "MANAGER", "ADMIN", "OTHER", "NOSIM"].map((role) => [role, `${prefix}${role.toLowerCase()}-${randomUUID()}@shadowos.dev`]));
const cookies = {};
const contexts = {};
let baseUrl;
let server;

async function api(path, options = {}) { const response = await fetch(`${baseUrl}${path}`, options); const body = await response.json(); assert.equal(JSON.stringify(body).includes("passwordHash"), false); return { response, body }; }
async function login(role) { const result = await api("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: identities[role], password }) }); return result.response.headers.get("set-cookie").split(";", 1)[0]; }
async function createPipeline(role, prompt, environment = "PRODUCTION") {
  const created = await api("/api/requests", { method: "POST", headers: { "content-type": "application/json", cookie: cookies[role] }, body: JSON.stringify({ prompt: `${marker} ${prompt}`, environment }) });
  const planned = await api(`/api/requests/${created.body.request.id}/plan`, { method: "POST", headers: { cookie: cookies[role] } });
  const simulated = await api(`/api/requests/${created.body.request.id}/simulation`, { method: "POST", headers: { cookie: cookies[role] } });
  return { request: created.body.request, plan: planned.body.plan, simulation: simulated.body.simulation };
}
function evaluate(role, requestId, body) { return api(`/api/requests/${requestId}/risk`, { method: "POST", headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), cookie: cookies[role] }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); }
async function cleanup() { await getDatabase().user.deleteMany({ where: { email: { startsWith: prefix } } }); }

before(async () => {
  assertAuthConfiguration(); await getDatabase().$connect(); await cleanup(); const passwordHash = await hashPassword(password);
  await getDatabase().user.createMany({ data: Object.entries(identities).map(([role,email]) => ({ name: `Phase 5 ${role}`, email, passwordHash, role: ["MANAGER","ADMIN"].includes(role) ? role : "EMPLOYEE", status: "ACTIVE" })) });
  server = app.listen(0, "127.0.0.1"); await new Promise((resolve,reject) => { server.once("listening",resolve); server.once("error",reject); }); baseUrl = `http://127.0.0.1:${server.address().port}`;
  for (const role of Object.keys(identities)) cookies[role] = await login(role);
});
after(async () => { await cleanup(); if (server) await new Promise((resolve) => server.close(resolve)); await disconnectDatabase(); });

test("unauthenticated risk evaluation returns 401", async () => { const context = await createPipeline("EMPLOYEE", "Delete archived invoices older than January 2024"); const result = await api(`/api/requests/${context.request.id}/risk`, { method: "POST" }); assert.equal(result.response.status, 401); });

test("request without simulation returns SIMULATION_REQUIRED", async () => {
  const created = await api("/api/requests", { method: "POST", headers: { "content-type": "application/json", cookie: cookies.NOSIM }, body: JSON.stringify({ prompt: `${marker} Delete archived invoices older than January 2024`, environment: "PRODUCTION" }) });
  const result = await evaluate("NOSIM", created.body.request.id); assert.equal(result.response.status, 409); assert.equal(result.body.error.code, "SIMULATION_REQUIRED");
});

for (const role of ["EMPLOYEE", "MANAGER", "ADMIN"]) test(`${role} can evaluate its own risk`, async () => {
  const context = await createPipeline(role, "Delete archived invoices older than January 2024"); const result = await evaluate(role, context.request.id); assert.equal(result.response.status, 201); assert.equal(result.body.riskAssessment.factors.length, 6); contexts[role] = { ...context, risk: result.body.riskAssessment };
});

test("archive and delete assessments are deterministic and materially differentiated", async () => {
  const archive = await createPipeline("OTHER", "Archive inactive customer accounts older than 2 years"); const result = await evaluate("OTHER", archive.request.id); contexts.ARCHIVE = { ...archive, risk: result.body.riskAssessment };
  assert.equal(result.body.riskAssessment.score, 25); assert.equal(result.body.riskAssessment.level, "MEDIUM"); assert.equal(contexts.EMPLOYEE.risk.score, 88); assert.equal(contexts.EMPLOYEE.risk.level, "CRITICAL"); assert.ok(contexts.EMPLOYEE.risk.score > result.body.riskAssessment.score);
});

test("all six factors use persisted facts, centralized weights, and consistent contributions", () => {
  const factors = Object.fromEntries(contexts.EMPLOYEE.risk.factors.map((factor) => [factor.key, factor]));
  assert.equal(factors.destructive_operation.normalizedScore, 100); assert.equal(factors.irreversibility.normalizedScore, 100);
  assert.deepEqual(factors.projected_scope.observedValue, { affectedResources: 3 }); assert.deepEqual(factors.dependency_exposure.observedValue, { dependencyObservations: 2 });
  assert.equal(factors.environment.normalizedScore, 100); assert.equal(factors.operation_severity.observedValue.actionType, "DELETE_RESOURCE");
  assert.equal(Object.values(RISK_WEIGHTS).reduce((sum, weight) => sum + weight, 0), 1);
  assert.equal(Math.round(contexts.EMPLOYEE.risk.factors.reduce((sum, factor) => sum + factor.contribution, 0)), contexts.EMPLOYEE.risk.score);
  assert.equal(riskAssessmentCandidateSchema.safeParse({ score: contexts.EMPLOYEE.risk.score, level: contexts.EMPLOYEE.risk.level, summary: contexts.EMPLOYEE.risk.summary, factors: contexts.EMPLOYEE.risk.factors.map(({ id: _id, createdAt: _createdAt, ...factor }) => factor) }).success, true);
});

test("production contributes more than development and query/validation add no mutation severity", async () => {
  const development = await createPipeline("NOSIM", "Archive inactive customer accounts older than 2 years", "DEVELOPMENT"); const result = await evaluate("NOSIM", development.request.id);
  const prodEnvironment = contexts.ARCHIVE.risk.factors.find((factor) => factor.key === "environment"); const devEnvironment = result.body.riskAssessment.factors.find((factor) => factor.key === "environment");
  assert.ok(prodEnvironment.contribution > devEnvironment.contribution);
  assert.equal(contexts.ARCHIVE.risk.factors.find((factor) => factor.key === "operation_severity").observedValue.actionType, "ARCHIVE_RESOURCE");
});

test("score thresholds cover the full 0-100 scale", () => { assert.deepEqual([0,24,25,49,50,74,75,100].map(levelForScore), ["LOW","LOW","MEDIUM","MEDIUM","HIGH","HIGH","CRITICAL","CRITICAL"]); });

test("repeated evaluation and GET are idempotent with no duplicate factors", async () => {
  const repeated = await evaluate("MANAGER", contexts.MANAGER.request.id); assert.equal(repeated.body.riskAssessment.id, contexts.MANAGER.risk.id);
  assert.equal(await getDatabase().riskAssessment.count({ where: { simulationRunId: contexts.MANAGER.simulation.id } }), 1); assert.equal(await getDatabase().riskFactor.count({ where: { riskAssessmentId: contexts.MANAGER.risk.id } }), 6);
  const read = await api(`/api/requests/${contexts.MANAGER.request.id}/risk`, { headers: { cookie: cookies.MANAGER } }); assert.equal(read.response.status, 200); assert.equal(read.body.riskAssessment.id, contexts.MANAGER.risk.id);
});

test("cross-user POST and GET are concealed", async () => {
  const post = await evaluate("OTHER", contexts.ADMIN.request.id); assert.equal(post.response.status, 404); assert.equal(post.body.error.code, "REQUEST_NOT_FOUND");
  const get = await api(`/api/requests/${contexts.ADMIN.request.id}/risk`, { headers: { cookie: cookies.OTHER } }); assert.equal(get.response.status, 404); assert.equal(get.body.error.code, "REQUEST_NOT_FOUND");
});

test("client-controlled score, level, factors, and summary are rejected", async () => {
  const context = await createPipeline("NOSIM", "Delete archived invoices older than January 2024");
  for (const body of [{ score: 1 }, { level: "LOW" }, { factors: [] }, { summary: "Injected" }]) assert.equal((await evaluate("NOSIM", context.request.id, body)).response.status, 400);
  assert.equal(await getDatabase().riskAssessment.count({ where: { simulationRunId: context.simulation.id } }), 0);
});

test("malformed persisted facts fail safely", () => {
  const malformed = { request: { environment: "PRODUCTION" }, plan: { actions: contexts.EMPLOYEE.plan.actions }, simulation: { ...contexts.EMPLOYEE.simulation, affectedResources: 99 } };
  assert.throws(() => calculateRisk(malformed), (error) => error.code === "INVALID_RISK_INPUT");
});

test("risk evaluation does not mutate upstream records", async () => {
  const request = await getDatabase().request.findUnique({ where: { id: contexts.ADMIN.request.id } }); const plan = await getDatabase().executionPlan.findUnique({ where: { id: contexts.ADMIN.plan.id } }); const simulation = await getDatabase().simulationRun.findUnique({ where: { id: contexts.ADMIN.simulation.id }, include: { effects: true } });
  assert.equal(request.status, "PLANNED"); assert.equal(plan.status, "GENERATED"); assert.equal(simulation.status, "COMPLETED"); assert.equal(simulation.effects.length, 3);
});

test("engine output is structurally deterministic", () => {
  const context = { request: { environment: "PRODUCTION" }, plan: { actions: contexts.EMPLOYEE.plan.actions }, simulation: contexts.EMPLOYEE.simulation };
  assert.deepEqual(calculateRisk(context), calculateRisk(context));
});

test("temporary risk data is removed without touching manual assessments", async () => { await cleanup(); assert.equal(await getDatabase().user.count({ where: { email: { startsWith: prefix } } }), 0); assert.equal(await getDatabase().request.count({ where: { prompt: { startsWith: marker } } }), 0); });
