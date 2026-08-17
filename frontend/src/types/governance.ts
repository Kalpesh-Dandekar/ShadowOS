export type PolicyOutcome = "PASSED" | "APPROVAL REQUIRED" | "BLOCKED";
export type PolicyStatus = "Enabled" | "Draft" | "Disabled";
export type PolicyEvaluation = { id: string; name: string; outcome: PolicyOutcome; evidence: string };
export type PolicyCatalogItem = { id: string; name: string; category: string; scope: string; enforcement: string; status: PolicyStatus; updated: string };

export type ApprovalQueueItem = { requestId: string; action: string; risk: "MEDIUM" | "HIGH" | "CRITICAL"; state: string; assignee: string; requestedBy: string; age: string };
export type ApprovalEvidence = { label: string; state: "verified" | "warning"; detail: string };

export type ExecutionStage = { label: string; timestamp: string; state: "completed" | "processing" | "pending" | "failed"; detail: string };
export type ExecutionMetric = { label: string; value: string; detail: string };

export type AuditEventType = "request" | "plan" | "simulation" | "risk" | "policy" | "approval" | "execution" | "verification" | "audit";
export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  type: AuditEventType;
  summary: string;
  requestId: string;
  runId?: string;
  source: string;
  previousState: string;
  newState: string;
  metadata: ReadonlyArray<readonly [string, string]>;
};
