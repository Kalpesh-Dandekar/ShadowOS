import { z } from "zod";

export const RISK_FACTOR_KEYS = ["destructive_operation", "irreversibility", "projected_scope", "dependency_exposure", "environment", "operation_severity"];
const observedValueSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]));

export const riskFactorCandidateSchema = z.object({
  key: z.enum(RISK_FACTOR_KEYS),
  label: z.string().trim().min(1).max(100),
  observedValue: observedValueSchema,
  normalizedScore: z.number().int().min(0).max(100),
  weight: z.number().min(0).max(1),
  contribution: z.number().min(0).max(100),
  explanation: z.string().trim().min(1).max(500),
  sourceType: z.enum(["REQUEST", "PLAN", "SIMULATION"]),
}).strict();

export const riskAssessmentCandidateSchema = z.object({
  score: z.number().int().min(0).max(100),
  level: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  summary: z.string().trim().min(1).max(1000),
  factors: z.array(riskFactorCandidateSchema).length(RISK_FACTOR_KEYS.length),
}).strict().superRefine((assessment, context) => {
  const weight = assessment.factors.reduce((sum, factor) => sum + factor.weight, 0);
  const contribution = assessment.factors.reduce((sum, factor) => sum + factor.contribution, 0);
  if (Math.abs(weight - 1) > 0.0001) context.addIssue({ code: "custom", path: ["factors"], message: "Risk factor weights must total 1" });
  if (Math.abs(Math.round(contribution) - assessment.score) > 0) context.addIssue({ code: "custom", path: ["score"], message: "Risk contributions must resolve to the score" });
  assessment.factors.forEach((factor, index) => {
    if (Math.abs(factor.contribution - Math.round(factor.normalizedScore * factor.weight * 100) / 100) > 0.001) context.addIssue({ code: "custom", path: ["factors", index, "contribution"], message: "Factor contribution is inconsistent" });
  });
});

export const emptyRiskBodySchema = z.preprocess((value) => value ?? {}, z.object({}).strict());
