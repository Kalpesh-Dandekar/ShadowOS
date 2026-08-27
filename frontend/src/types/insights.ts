export type GovernanceActivityPoint = { day: string; total: number; approved: number; blocked: number };
export type PolicyEffectiveness = { policy: string; evaluations: number; triggered: number; blocked: number; approvalGates: number; effectiveness: string };
export type ActivityCategory = "AI Operations" | "Governance" | "Approvals" | "Executions" | "Security";
export type ActivityItem = { id: string; category: ActivityCategory; title: string; description: string; actor: string; requestId?: string; timestamp: string; tone: "safe" | "warning" | "critical" | "info" | "intelligence" };
export type NotificationCategory = "Approvals" | "Risk" | "Execution" | "Policy" | "System";
export type NotificationItem = { id: string; category: NotificationCategory; title: string; description: string; reference: string; metadata: string; timestamp: string; priority: "normal" | "high" | "critical"; unread: boolean; href?: string };
export type SettingsSection = "Organization" | "Profile" | "AI Configuration" | "Security" | "Access & Roles" | "Risk Thresholds" | "Approval Rules" | "Notifications" | "Integrations";
