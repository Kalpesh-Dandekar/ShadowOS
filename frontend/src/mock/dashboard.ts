import type { ActivityPoint, GovernanceMetric, PipelineStage, RecentAction, RiskLevel } from "../types/dashboard";

export const governanceMetrics: GovernanceMetric[] = [
  { label: "AI Actions", value: "1,284", context: "Last 30 days", trend: "+12.4%", tone: "neutral" },
  { label: "Pending Approvals", value: "18", context: "6 high priority", trend: "Needs review", tone: "warning" },
  { label: "Average Risk", value: "34", context: "Moderate exposure", trend: "−4.8 pts", tone: "safe" },
  { label: "Policy Blocks", value: "47", context: "3.7% of actions", trend: "+8 this week", tone: "critical" },
];

export const pipelineStages: PipelineStage[] = [
  { label: "Plan", state: "completed", detail: "12 actions" },
  { label: "Simulate", state: "completed", detail: "1,284 records" },
  { label: "Risk", state: "warning", detail: "High · 78" },
  { label: "Policy", state: "completed", detail: "4/4 passed" },
  { label: "Approve", state: "awaiting approval", detail: "Operator review" },
  { label: "Execute", state: "idle", detail: "Held" },
  { label: "Audit", state: "idle", detail: "Queued" },
];

export const activityData: ActivityPoint[] = [
  { day: "Mon", actions: 118, blocked: 6 }, { day: "Tue", actions: 156, blocked: 9 },
  { day: "Wed", actions: 142, blocked: 4 }, { day: "Thu", actions: 191, blocked: 12 },
  { day: "Fri", actions: 224, blocked: 8 }, { day: "Sat", actions: 174, blocked: 5 },
  { day: "Sun", actions: 203, blocked: 3 },
];

export const riskDistribution: Record<RiskLevel, number> = { Low: 54, Medium: 29, High: 13, Critical: 4 };

export const recentActions: RecentAction[] = [
  { id: "REQ-8F2A", action: "Delete archived invoices", requestedBy: "Finance Agent", type: "DELETE", risk: "High", decision: "Approval required", status: "Pending", time: "2m ago" },
  { id: "REQ-71CB", action: "Export customer records", requestedBy: "Support Agent", type: "EXPORT", risk: "Critical", decision: "Blocked by PII-04", status: "Blocked", time: "11m ago" },
  { id: "REQ-9D14", action: "Update access permissions", requestedBy: "IAM Agent", type: "UPDATE", risk: "Medium", decision: "Policy passed", status: "Approved", time: "18m ago" },
  { id: "REQ-3AA7", action: "Archive completed reports", requestedBy: "Ops Agent", type: "ARCHIVE", risk: "Low", decision: "Auto-approved", status: "Executed", time: "31m ago" },
  { id: "REQ-62E0", action: "Bulk rename legal documents", requestedBy: "Legal Agent", type: "BULK_EDIT", risk: "Medium", decision: "Evaluating", status: "Simulating", time: "44m ago" },
];
