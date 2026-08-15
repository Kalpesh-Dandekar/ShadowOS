export type OperationScenario = {
  requestId: string;
  request: string;
  requestedBy: string;
  environment: "Production";
  createdAt: string;
  planVersion: string;
  actionCount: number;
  resources: number;
  storage: string;
  dependencies: number;
  riskLevel: "HIGH";
  riskScore: number;
};

export type PlanAction = {
  index: number;
  type: "SEARCH" | "FILTER" | "DELETE";
  target: string;
  argument: string;
  dependency: string;
  scope: string;
  affectedResources: number;
  reversible: boolean;
  requirement: string;
};

export type SimulationMetric = { label: string; value: string; detail: string };
export type ResourceRow = { name: string; kind: "folder" | "group" | "file" | "dependency"; state: "unchanged" | "removed" | "modified" | "dependent"; detail?: string };
export type RiskFactor = { name: string; observed: string; contribution: number; rationale: string };
