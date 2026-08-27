import { z } from "zod";

export const roleRequestParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const roleRequestQuerySchema = z
  .object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional() })
  .strict();

export const rejectRoleRequestSchema = z
  .object({ comment: z.string().trim().min(1).max(500).optional() })
  .strict()
  .default({});
