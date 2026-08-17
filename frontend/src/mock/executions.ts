import type { ExecutionMetric, ExecutionStage } from "../types/governance";
import { operationScenario } from "./command-center";

export { operationScenario };

export const executionStages: ExecutionStage[] = [
  { label: "Authorization verified", timestamp: "11:06:02.104", state: "completed", detail: "Manager approval validated" },
  { label: "Workspace locked", timestamp: "11:06:02.318", state: "completed", detail: "Finance / Invoices isolated" },
  { label: "Recovery snapshot created", timestamp: "11:06:03.482", state: "completed", detail: "SNP-8F2A-01 · 143 resources" },
  { label: "Resources identified", timestamp: "11:06:04.006", state: "completed", detail: "143 targets match approved plan" },
  { label: "Executing changes", timestamp: "11:06:13.791", state: "completed", detail: "143 completed · 0 failed" },
  { label: "Verification", timestamp: "11:06:15.988", state: "completed", detail: "Scope and dependency integrity verified" },
  { label: "Audit finalization", timestamp: "11:06:16.304", state: "completed", detail: "Execution record finalized" },
];

export const executionMetrics: ExecutionMetric[] = [
  { label: "Resources targeted", value: "143", detail: "Approved scope" },
  { label: "Completed", value: "143", detail: "100% successful" },
  { label: "Failed", value: "0", detail: "No exceptions" },
  { label: "Storage reclaimed", value: "384 MB", detail: "Verified" },
  { label: "Workflows verified", value: "3", detail: "Dependencies intact" },
  { label: "Elapsed", value: "14.2s", detail: "End-to-end" },
];

export const executionIdentity = [
  ["Run ID", "RUN-8F2A-01"], ["Request ID", "REQ-8F2A"], ["Environment", "Production"],
  ["Plan version", "v1.3"], ["Risk", "72 / HIGH"], ["Approved by", "Manager / Kalpesh Dandekar"],
  ["Recovery snapshot", "SNP-8F2A-01"],
] as const;
