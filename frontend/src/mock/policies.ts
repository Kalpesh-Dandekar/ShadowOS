import type { PolicyCatalogItem, PolicyEvaluation } from "../types/governance";
import { operationScenario } from "./command-center";

export { operationScenario };

export const policyEvaluations: PolicyEvaluation[] = [
  { id: "POL-RETENTION-02", name: "Data Retention Policy", outcome: "PASSED", evidence: "Resources exceed minimum retention window" },
  { id: "POL-BULK-DELETE-04", name: "Bulk Deletion Control", outcome: "APPROVAL REQUIRED", evidence: "DELETE scope contains 143 resources" },
  { id: "POL-FIN-ARCHIVE-07", name: "Financial Archive Protection", outcome: "PASSED", evidence: "Recovery snapshot is available" },
  { id: "POL-WORK-HOURS-03", name: "Working Hours Policy", outcome: "PASSED", evidence: "Request submitted within approved window" },
];

export const policyCatalog: PolicyCatalogItem[] = [
  { id: "POL-BULK-DELETE-04", name: "Bulk Deletion Control", category: "Destructive actions", scope: "Production", enforcement: "Approval gate", status: "Enabled", updated: "12 Aug 2026" },
  { id: "POL-FIN-ARCHIVE-07", name: "Financial Archive Protection", category: "Data retention", scope: "Finance", enforcement: "Required", status: "Enabled", updated: "09 Aug 2026" },
  { id: "POL-PII-EXPORT-05", name: "PII Export Restriction", category: "Data privacy", scope: "Organization", enforcement: "Block", status: "Enabled", updated: "04 Aug 2026" },
  { id: "POL-IAM-02", name: "Privileged Access Modification", category: "Access control", scope: "IAM", enforcement: "Approval gate", status: "Enabled", updated: "28 Jul 2026" },
  { id: "POL-WORK-HOURS-03", name: "Working Hours Guard", category: "Operations", scope: "Production", enforcement: "Conditional", status: "Draft", updated: "21 Jul 2026" },
  { id: "POL-SNAPSHOT-01", name: "Snapshot Requirement", category: "Recovery", scope: "Destructive actions", enforcement: "Required", status: "Enabled", updated: "18 Jul 2026" },
];

export const selectedPolicyLogic = [
  ["IF", "action.type", "= DELETE"],
  ["AND", "resource.count", "> 50"],
  ["THEN", "requireApproval", "(MANAGER)"],
] as const;

export const snapshotPolicyLogic = [
  ["IF", "resource.path", "matches /Invoices/archive"],
  ["AND", "action.destructive", "= true"],
  ["THEN", "requireSnapshot", "()"],
] as const;
