import { Router } from "express";

import { create, getById, list } from "../controllers/requestController.js";
import { generate, getPlan } from "../controllers/planController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createRequestSchema,
  requestListQuerySchema,
  requestParamsSchema,
} from "../schemas/requestSchemas.js";
import { emptyPlanBodySchema } from "../schemas/planSchemas.js";

export const requestRouter = Router();

requestRouter.use(authenticate);
requestRouter.post("/", validate(createRequestSchema), create);
requestRouter.get("/", validateQuery(requestListQuerySchema), list);
requestRouter.post("/:id/plan", validateParams(requestParamsSchema), validate(emptyPlanBodySchema), generate);
requestRouter.get("/:id/plan", validateParams(requestParamsSchema), getPlan);
requestRouter.get("/:id", validateParams(requestParamsSchema), getById);
