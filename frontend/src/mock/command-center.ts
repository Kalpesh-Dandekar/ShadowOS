import type { OperationScenario, PlanAction } from "../types/operation";

export const operationScenario: OperationScenario = {
  requestId: "REQ-8F2A",
  request: "Delete archived invoices older than January 2024",
  requestedBy: "Kalpesh Dandekar",
  environment: "Production",
  createdAt: "15 Aug 2026 · 10:42 IST",
  planVersion: "v1.3",
  actionCount: 3,
  resources: 143,
  storage: "384 MB",
  dependencies: 3,
  riskLevel: "HIGH",
  riskScore: 72,
};

export const commandStages = [
  { label: "Interpreting intent", state: "complete" },
  { label: "Generating structured actions", state: "complete" },
  { label: "Analyzing resource scope", state: "complete" },
  { label: "Preparing governance pipeline", state: "ready" },
] as const;

export const planActions: PlanAction[] = [
  { index: 1, type: "SEARCH", target: "/Invoices/archive", argument: "recursive: true", dependency: "Root action", scope: "Archive workspace", affectedResources: 486, reversible: true, requirement: "Read access" },
  { index: 2, type: "FILTER", target: "SEARCH results", argument: "created_at < 2024-01-01", dependency: "Depends on 01", scope: "486 candidates", affectedResources: 143, reversible: true, requirement: "Schema valid" },
  { index: 3, type: "DELETE", target: "143 matching resources", argument: "mode: governed", dependency: "Depends on 02", scope: "384 MB", affectedResources: 143, reversible: true, requirement: "Manager approval" },
];
