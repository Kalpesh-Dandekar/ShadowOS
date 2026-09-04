import { z } from "zod";
export const approvalParamsSchema = z.object({ approvalId: z.string().uuid() }).strict();
export const approvalQuerySchema = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING") }).strict();
export const approvalDecisionSchema = z.preprocess((value) => value ?? {}, z.object({ comment: z.string().trim().min(1).max(1000).optional() }).strict());
