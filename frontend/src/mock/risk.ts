import type { RiskFactor } from "../types/operation";
import { operationScenario } from "./command-center";

export { operationScenario };

export const riskFactors: RiskFactor[] = [
  { name: "Destructive operation", observed: "DELETE", contribution: 30, rationale: "Deletion removes workspace resources and requires recovery controls." },
  { name: "Large resource scope", observed: "143 resources", contribution: 18, rationale: "The request affects a bulk set rather than an isolated resource." },
  { name: "Sensitive directory", observed: "/Invoices/archive", contribution: 14, rationale: "Archived financial documents remain subject to governance controls." },
  { name: "Bulk modification", observed: "Batch operation", contribution: 10, rationale: "One approval can affect the entire selected resource set." },
  { name: "Recoverable operation", observed: "Snapshot available", contribution: -8, rationale: "Snapshot-based rollback reduces permanent exposure." },
  { name: "Dependency impact", observed: "3 workflows", contribution: 8, rationale: "Downstream workflows reference resources in the proposed scope." },
];

export const riskScale = [
  { label: "LOW", range: "0–29", start: 0, width: 30 },
  { label: "MEDIUM", range: "30–49", start: 30, width: 20 },
  { label: "HIGH", range: "50–74", start: 50, width: 25 },
  { label: "CRITICAL", range: "75–100", start: 75, width: 25 },
] as const;
