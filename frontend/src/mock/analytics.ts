import type { GovernanceActivityPoint, PolicyEffectiveness } from "../types/insights";

export const analyticsMetrics = [
  { label: "Governed Actions", value: "1,284", context: "+12.4% governed volume", tone: "info" },
  { label: "Safe Execution Rate", value: "96.3%", context: "+2.1 pts safe execution", tone: "safe" },
  { label: "Risky Actions Prevented", value: "47", context: "12 critical · 35 high-risk", tone: "critical" },
  { label: "Average Approval Time", value: "4m 18s", context: "−38s from prior period", tone: "warning" },
] as const;

export const governanceActivity: GovernanceActivityPoint[] = [
  { day: "Jul 17", total: 31, approved: 24, blocked: 2 }, { day: "Jul 20", total: 44, approved: 35, blocked: 3 },
  { day: "Jul 23", total: 38, approved: 30, blocked: 2 }, { day: "Jul 26", total: 52, approved: 41, blocked: 4 },
  { day: "Jul 29", total: 47, approved: 38, blocked: 2 }, { day: "Aug 01", total: 61, approved: 49, blocked: 5 },
  { day: "Aug 04", total: 55, approved: 44, blocked: 3 }, { day: "Aug 07", total: 68, approved: 55, blocked: 4 },
  { day: "Aug 10", total: 64, approved: 52, blocked: 3 }, { day: "Aug 14", total: 73, approved: 59, blocked: 5 },
];

export const riskTrend = [{ week: "Week 1", value: 46 }, { week: "Week 2", value: 43 }, { week: "Week 3", value: 39 }, { week: "Week 4", value: 34 }] as const;
export const decisionDistribution = [{ label: "Approved", value: 68 }, { label: "Rejected", value: 17 }, { label: "Escalated", value: 9 }, { label: "Expired / Cancelled", value: 6 }] as const;
export const analyticsRiskDistribution = [{ label: "Low", value: 54 }, { label: "Medium", value: 29 }, { label: "High", value: 13 }, { label: "Critical", value: 4 }] as const;

export const policyEffectiveness: PolicyEffectiveness[] = [
  { policy: "Bulk Deletion Control", evaluations: 18, triggered: 18, blocked: 2, approvalGates: 16, effectiveness: "100%" },
  { policy: "PII Export Restriction", evaluations: 12, triggered: 12, blocked: 12, approvalGates: 0, effectiveness: "100%" },
  { policy: "Financial Archive Protection", evaluations: 31, triggered: 0, blocked: 0, approvalGates: 0, effectiveness: "100% passed" },
  { policy: "Working Hours Policy", evaluations: 84, triggered: 3, blocked: 0, approvalGates: 3, effectiveness: "96.4% clear" },
];
