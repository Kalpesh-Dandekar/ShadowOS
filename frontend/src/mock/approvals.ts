import type { ApprovalEvidence, ApprovalQueueItem } from "../types/governance";
import { operationScenario } from "./command-center";

export { operationScenario };

export const approvalQueue: ApprovalQueueItem[] = [
  { requestId: "REQ-8F2A", action: "Delete archived invoices", risk: "HIGH", state: "Awaiting your review", assignee: "You", requestedBy: "Kalpesh Dandekar", age: "24m" },
  { requestId: "REQ-71CB", action: "Export customer records", risk: "CRITICAL", state: "Escalated", assignee: "Security Lead", requestedBy: "Support Agent", age: "41m" },
  { requestId: "REQ-9D14", action: "Update access permissions", risk: "MEDIUM", state: "Pending", assignee: "IAM Manager", requestedBy: "IAM Agent", age: "1h 08m" },
];

export const approvalEvidence: ApprovalEvidence[] = [
  { label: "Simulation complete", state: "verified", detail: "Isolated preview succeeded" },
  { label: "143 resources affected", state: "verified", detail: "384 MB total impact" },
  { label: "Snapshot available", state: "verified", detail: "SNP-8F2A-01" },
  { label: "3 dependent workflows detected", state: "warning", detail: "Impact reviewed" },
  { label: "No blocking policies", state: "verified", detail: "3 policies passed" },
  { label: "1 approval gate triggered", state: "warning", detail: "Manager required" },
];
