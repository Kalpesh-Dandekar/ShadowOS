export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskSourceType = "REQUEST" | "PLAN" | "SIMULATION";

export type RiskFactor = {
  id: string;
  key: string;
  label: string;
  observedValue: string | number | boolean | null | Record<string, unknown>;
  normalizedScore: number;
  weight: number;
  contribution: number;
  explanation: string;
  sourceType: RiskSourceType;
  createdAt: string;
};

export type RiskAssessment = {
  id: string;
  simulationRunId: string;
  score: number;
  level: RiskLevel;
  summary: string;
  factors: RiskFactor[];
  createdAt: string;
  updatedAt: string;
};
