import { z } from "zod";

export const createRequestSchema = z
  .object({
    prompt: z.string().trim().min(10, "Prompt must be at least 10 characters").max(2000),
    environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]),
  })
  .strict();

export const requestListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const requestParamsSchema = z.object({ id: z.string().uuid() }).strict();
