import type { AuditEvent } from "../types/governance";
import { operationScenario } from "./command-center";

export { operationScenario };

const base = { requestId: "REQ-8F2A", source: "ShadowOS Control Plane" } as const;
export const auditEvents: AuditEvent[] = [
  { ...base, id: "EVT-8F2A-001", timestamp: "10:42:00.000", actor: "Kalpesh Dandekar", type: "request", summary: "Request submitted", previousState: "None", newState: "Submitted", metadata: [["Request", "Delete archived invoices older than January 2024"]] },
  { ...base, id: "EVT-8F2A-002", timestamp: "10:42:04.218", actor: "Planning service (preview)", type: "plan", summary: "AI plan generated", previousState: "Submitted", newState: "Planned", metadata: [["Plan", "v1.3"], ["Actions", "3"]] },
  { ...base, id: "EVT-8F2A-003", timestamp: "10:42:04.602", actor: "Plan validator (preview)", type: "plan", summary: "Plan validated", previousState: "Planned", newState: "Validated", metadata: [["Targets", "Resolved"], ["Dependencies", "Verified"]] },
  { ...base, id: "EVT-8F2A-004", timestamp: "10:43:11.090", actor: "Simulation service (preview)", type: "simulation", summary: "Simulation started", previousState: "Validated", newState: "Simulating", metadata: [["Snapshot", "Workspace preview"]] },
  { ...base, id: "EVT-8F2A-005", timestamp: "10:43:13.490", actor: "Simulation service (preview)", type: "simulation", summary: "Simulation completed", previousState: "Simulating", newState: "Simulated", metadata: [["Resources", "143"], ["Storage", "384 MB"]] },
  { ...base, id: "EVT-8F2A-006", timestamp: "10:43:14.004", actor: "Risk engine (preview)", type: "risk", summary: "Risk calculated", previousState: "Simulated", newState: "High risk", metadata: [["Score", "72 / 100"], ["Level", "HIGH"]] },
  { ...base, id: "EVT-8F2A-007", timestamp: "10:43:14.708", actor: "Policy engine (preview)", type: "policy", summary: "Policies evaluated", previousState: "High risk", newState: "Conditional approval", metadata: [["Policy gate", "POL-BULK-DELETE-04"], ["Passed", "3"]] },
  { ...base, id: "EVT-8F2A-008", timestamp: "10:43:15.002", actor: "Approval router (preview)", type: "approval", summary: "Approval requested", previousState: "Conditional approval", newState: "Awaiting manager", metadata: [["Required role", "Manager"]] },
  { ...base, id: "EVT-8F2A-009", timestamp: "11:05:48.331", actor: "Manager / Kalpesh Dandekar", type: "approval", summary: "Manager approved", previousState: "Awaiting manager", newState: "Approved", metadata: [["Decision", "APPROVED"], ["Risk at approval", "72"], ["Policy gate", "POL-BULK-DELETE-04"]] },
  { ...base, id: "EVT-8F2A-010", timestamp: "11:06:02.104", actor: "Execution service (preview)", type: "execution", summary: "Execution started", previousState: "Approved", newState: "Executing", runId: "RUN-8F2A-01", metadata: [["Plan", "v1.3"]] },
  { ...base, id: "EVT-8F2A-011", timestamp: "11:06:03.482", actor: "Recovery service (preview)", type: "execution", summary: "Recovery snapshot created", previousState: "Executing", newState: "Snapshot ready", runId: "RUN-8F2A-01", metadata: [["Snapshot", "SNP-8F2A-01"], ["Resources", "143"]] },
  { ...base, id: "EVT-8F2A-012", timestamp: "11:06:13.791", actor: "Execution service (preview)", type: "execution", summary: "Execution completed", previousState: "Snapshot ready", newState: "Executed", runId: "RUN-8F2A-01", metadata: [["Resources affected", "143"], ["Failures", "0"], ["Snapshot", "SNP-8F2A-01"]] },
  { ...base, id: "EVT-8F2A-013", timestamp: "11:06:15.988", actor: "Verification service (preview)", type: "verification", summary: "Verification passed", previousState: "Executed", newState: "Verified", runId: "RUN-8F2A-01", metadata: [["Dependencies", "3 verified"], ["Failures", "0"]] },
  { ...base, id: "EVT-8F2A-014", timestamp: "11:06:16.304", actor: "Audit service (preview)", type: "audit", summary: "Audit finalized", previousState: "Verified", newState: "Recorded", runId: "RUN-8F2A-01", metadata: [["Integrity", "Recorded"], ["Environment", "Production"]] },
];
