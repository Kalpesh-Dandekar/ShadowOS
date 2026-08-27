import type { Role } from "../types/auth";

export type NavigationItem = { label: string; href: string; roles: readonly Role[] };
export type NavigationGroup = { label: string; items: readonly NavigationItem[] };

const allRoles: readonly Role[] = ["EMPLOYEE", "MANAGER", "ADMIN"];
const managementRoles: readonly Role[] = ["MANAGER", "ADMIN"];
const adminRoles: readonly Role[] = ["ADMIN"];

export const navigationGroups: readonly NavigationGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/dashboard", roles: allRoles }] },
  { label: "AI Operations", items: [
    { label: "Command Center", href: "/command-center", roles: allRoles },
    { label: "Action Plans", href: "/action-plans", roles: allRoles },
    { label: "Shadow Workspace", href: "/shadow-workspace", roles: allRoles },
  ] },
  { label: "Governance", items: [
    { label: "Risk Engine", href: "/risk", roles: allRoles },
    { label: "Policies", href: "/policies", roles: adminRoles },
    { label: "Approvals", href: "/approvals", roles: managementRoles },
  ] },
  { label: "Operations", items: [
    { label: "Executions", href: "/executions", roles: allRoles },
    { label: "Audit Logs", href: "/audit", roles: adminRoles },
  ] },
  { label: "Insights", items: [
    { label: "Analytics", href: "/analytics", roles: adminRoles },
    { label: "Activity", href: "/activity", roles: allRoles },
  ] },
  { label: "System", items: [
    { label: "Notifications", href: "/notifications", roles: allRoles },
    { label: "Settings", href: "/settings", roles: allRoles },
  ] },
];

export function navigationForRole(role: Role) {
  return navigationGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);
}

export function roleLabel(role: Role) {
  return { ADMIN: "Administrator", MANAGER: "Manager", EMPLOYEE: "Employee" }[role];
}

export function userInitials(name: string) {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
  return initials.toUpperCase() || "SO";
}
