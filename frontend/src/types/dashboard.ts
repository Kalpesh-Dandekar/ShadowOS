export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ActionStatus = "Approved" | "Pending" | "Blocked" | "Executed" | "Simulating";
export type PipelineState = "completed" | "processing" | "warning" | "blocked" | "awaiting approval" | "idle" | "failed";

export type GovernanceMetric = { label: string; value: string; context: string; trend: string; tone: "neutral" | "safe" | "warning" | "critical" };
export type PipelineStage = { label: string; state: PipelineState; detail: string };
export type RecentAction = { id: string; action: string; requestedBy: string; type: string; risk: RiskLevel; decision: string; status: ActionStatus; time: string };
export type ActivityPoint = { day: string; actions: number; blocked: number };
