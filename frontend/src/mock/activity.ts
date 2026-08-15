import type { ActivityItem } from "../types/insights";

export const activityItems: ActivityItem[] = [
  { id: "ACT-001", category: "Executions", title: "Execution completed", description: "Delete archived invoices · 143 resources changed", actor: "Approved by Kalpesh Dandekar", requestId: "REQ-8F2A", timestamp: "2 minutes ago", tone: "safe" },
  { id: "ACT-002", category: "Approvals", title: "High-risk action approved", description: "Risk 72 / HIGH · Manager approval", actor: "Kalpesh Dandekar", requestId: "REQ-8F2A", timestamp: "5 minutes ago", tone: "warning" },
  { id: "ACT-003", category: "Security", title: "Policy blocked operation", description: "Export customer records · PII Export Restriction", actor: "Policy Engine", requestId: "REQ-71CB", timestamp: "11 minutes ago", tone: "critical" },
  { id: "ACT-004", category: "AI Operations", title: "Execution plan generated", description: "Update access permissions · 4 actions structured", actor: "IAM Agent", requestId: "REQ-9D14", timestamp: "18 minutes ago", tone: "intelligence" },
  { id: "ACT-005", category: "Executions", title: "Rollback initiated", description: "Restore modified financial reports · SNP-4C91-02", actor: "Finance Operator", requestId: "REQ-4C91", timestamp: "26 minutes ago", tone: "warning" },
  { id: "ACT-006", category: "AI Operations", title: "Simulation completed", description: "Bulk rename legal documents · 214 resources evaluated", actor: "Legal Agent", requestId: "REQ-62E0", timestamp: "44 minutes ago", tone: "info" },
  { id: "ACT-007", category: "Security", title: "Critical risk detected", description: "PII export request · Risk 88 / CRITICAL", actor: "Risk Engine", requestId: "REQ-71CB", timestamp: "46 minutes ago", tone: "critical" },
  { id: "ACT-008", category: "Governance", title: "Policy updated", description: "Bulk Deletion Control threshold revised", actor: "Administrator", timestamp: "2 hours ago", tone: "info" },
  { id: "ACT-009", category: "Governance", title: "User role changed", description: "Aarav Mehta · Employee → Manager", actor: "Administrator", timestamp: "Yesterday", tone: "warning" },
];
