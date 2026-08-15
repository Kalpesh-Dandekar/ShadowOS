import type { NotificationItem } from "../types/insights";

export const notificationItems: NotificationItem[] = [
  { id: "NOT-001", category: "Approvals", title: "Approval Required", description: "Bulk deletion requires Manager approval", reference: "REQ-8F2A", metadata: "HIGH risk · 72/100", timestamp: "2m ago", priority: "high", unread: true, href: "/approvals" },
  { id: "NOT-002", category: "Risk", title: "Critical Risk Detected", description: "Customer export classified as CRITICAL", reference: "REQ-71CB", metadata: "Risk 88/100", timestamp: "11m ago", priority: "critical", unread: true, href: "/risk" },
  { id: "NOT-003", category: "Execution", title: "Execution Completed", description: "143 resources processed successfully", reference: "REQ-8F2A", metadata: "RUN-8F2A-01", timestamp: "14m ago", priority: "normal", unread: true, href: "/executions" },
  { id: "NOT-004", category: "Policy", title: "Policy Block", description: "PII Export Restriction prevented execution", reference: "REQ-71CB", metadata: "POL-PII-EXPORT-05", timestamp: "18m ago", priority: "critical", unread: true, href: "/policies" },
  { id: "NOT-005", category: "System", title: "Recovery Snapshot Created", description: "143 resources protected before execution", reference: "SNP-8F2A-01", metadata: "30-day retention", timestamp: "21m ago", priority: "normal", unread: true, href: "/executions" },
  { id: "NOT-006", category: "Policy", title: "Policy Updated", description: "Bulk deletion threshold changed", reference: "POL-BULK-DELETE-04", metadata: "Updated by Administrator", timestamp: "2h ago", priority: "normal", unread: false, href: "/policies" },
  { id: "NOT-007", category: "System", title: "System Operational", description: "All ShadowOS control-plane services nominal", reference: "SYSTEM", metadata: "7/7 services healthy", timestamp: "Today", priority: "normal", unread: false },
];
