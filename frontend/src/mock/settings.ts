import type { SettingsSection } from "../types/insights";

export const settingsSections: SettingsSection[] = ["Organization", "Profile", "AI Configuration", "Security", "Risk Thresholds", "Approval Rules", "Notifications", "Integrations"];
export const organizationSettings = [["Organization Name", "ShadowOS Demo Organization"], ["Default Environment", "Production"], ["Timezone", "Asia/Kolkata"], ["Audit Retention", "365 days"]] as const;
export const aiSettings = [["Primary Provider", "Google Gemini · planned"], ["Planner Mode", "Structured Output"], ["Schema Validation", "Enabled"], ["Direct LLM Execution", "DISABLED"]] as const;
export const securitySettings = [["Require approval for destructive production actions", "Enabled"], ["Session timeout", "30 minutes"], ["Enforce role-based access", "Enabled"], ["Require recovery snapshot when supported", "Enabled"]] as const;
export const riskThresholds = [["LOW", "0–29"], ["MEDIUM", "30–49"], ["HIGH", "50–74"], ["CRITICAL", "75–100"]] as const;
export const approvalRules = [["High Risk Actions", "Manager approval"], ["Critical Actions", "Administrator approval"], ["Bulk Destructive Actions", "Manager approval"], ["Blocked Policy Result", "Execution prohibited"]] as const;
export const notificationSettings = ["Approval requests", "Critical risk", "Policy blocks", "Execution completion", "Rollback events", "System alerts"] as const;
export const futureIntegrations = [["GitHub", "Repository operations"], ["Slack", "Approval and risk notifications"], ["Google Drive", "Governed document operations"]] as const;
