import type { ResourceRow, SimulationMetric } from "../types/operation";
import { operationScenario } from "./command-center";

export { operationScenario };

export const simulationMetrics: SimulationMetric[] = [
  { label: "Resources scanned", value: "486", detail: "Archive workspace" },
  { label: "Resources matched", value: "143", detail: "Before 01 Jan 2024" },
  { label: "Resources affected", value: "143", detail: "Deletion proposed" },
  { label: "Storage impact", value: "384 MB", detail: "Would be reclaimed" },
  { label: "Dependencies", value: "3", detail: "Workflows require review" },
  { label: "Recoverability", value: "100%", detail: "Snapshot available" },
  { label: "Simulation time", value: "2.4s", detail: "Isolated preview" },
];

export const resourceRows: ResourceRow[] = [
  { name: "Invoices/", kind: "folder", state: "unchanged", detail: "Finance workspace" },
  { name: "active/", kind: "folder", state: "unchanged", detail: "2,814 files unchanged" },
  { name: "archive/", kind: "folder", state: "modified", detail: "486 files scanned" },
  { name: "invoice_2023_001.pdf", kind: "file", state: "removed", detail: "2.8 MB" },
  { name: "invoice_2023_002.pdf", kind: "file", state: "removed", detail: "3.1 MB" },
  { name: "+ 141 matching archived invoices", kind: "group", state: "removed", detail: "378.1 MB" },
  { name: "invoice_2024_001.pdf → present", kind: "file", state: "unchanged", detail: "Boundary protected" },
  { name: "reports/", kind: "folder", state: "unchanged", detail: "No direct changes" },
  { name: "monthly-close workflow", kind: "dependency", state: "dependent", detail: "References 67 affected files" },
  { name: "tax-export workflow", kind: "dependency", state: "dependent", detail: "References 43 affected files" },
  { name: "archive-index workflow", kind: "dependency", state: "dependent", detail: "References 143 affected files" },
];
