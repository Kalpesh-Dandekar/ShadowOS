import { z } from "zod";

export const PLAN_ACTION_TYPES = [
  "QUERY_RESOURCE",
  "VALIDATE_SCOPE",
  "CREATE_RESOURCE",
  "UPDATE_RESOURCE",
  "ARCHIVE_RESOURCE",
  "DELETE_RESOURCE",
];

export const PLAN_RESOURCE_TYPES = ["INVOICE", "CUSTOMER_ACCOUNT", "USER_ACCOUNT", "FILE", "RECORD"];

const targetValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const planActionCandidateSchema = z.object({
  position: z.number().int().positive(),
  type: z.enum(PLAN_ACTION_TYPES),
  resourceType: z.enum(PLAN_RESOURCE_TYPES),
  description: z.string().trim().min(1).max(500),
  target: z.record(z.string(), targetValueSchema),
  destructive: z.boolean(),
  reversible: z.boolean(),
  estimatedScope: z.string().trim().min(1).max(200).nullable(),
  reason: z.string().trim().min(1).max(500),
}).strict();

export const planCandidateSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  actions: z.array(planActionCandidateSchema).min(1).max(12),
}).strict().superRefine((candidate, context) => {
  candidate.actions.forEach((action, index) => {
    if (action.position !== index + 1) {
      context.addIssue({ code: "custom", path: ["actions", index, "position"], message: "Actions must be sequentially ordered" });
    }
  });
});

export const emptyPlanBodySchema = z.preprocess((value) => value ?? {}, z.object({}).strict());
