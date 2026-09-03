import { z } from "zod";

const safeStateValue = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const safeState = z.record(z.string(), safeStateValue);

export const simulationEffectCandidateSchema = z.object({
  planActionId: z.string().uuid(),
  resourceKey: z.string().regex(/^[A-Z]+-SIM-\d{3}$/),
  resourceType: z.enum(["INVOICE", "CUSTOMER_ACCOUNT"]),
  effectType: z.enum(["ARCHIVE_RESOURCE", "DELETE_RESOURCE"]),
  beforeState: safeState,
  afterState: safeState,
  changed: z.literal(true),
}).strict();

export const simulationCandidateSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  totalResourcesExamined: z.number().int().nonnegative(),
  matchedResources: z.number().int().nonnegative(),
  affectedResources: z.number().int().nonnegative(),
  dependencyObservations: z.number().int().nonnegative(),
  effects: z.array(simulationEffectCandidateSchema).max(100),
}).strict().superRefine((candidate, context) => {
  if (candidate.affectedResources !== candidate.effects.length) {
    context.addIssue({ code: "custom", path: ["affectedResources"], message: "Affected count must equal changed effects" });
  }
  if (candidate.matchedResources > candidate.totalResourcesExamined || candidate.affectedResources > candidate.matchedResources) {
    context.addIssue({ code: "custom", path: ["matchedResources"], message: "Simulation counts are inconsistent" });
  }
});

export const emptySimulationBodySchema = z.preprocess((value) => value ?? {}, z.object({}).strict());
