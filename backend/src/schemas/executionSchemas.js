import { z } from "zod";
export const executionParamsSchema = z.object({ executionId: z.string().uuid() }).strict();
export const emptyExecutionBodySchema = z.preprocess((value) => value ?? {}, z.object({}).strict());
