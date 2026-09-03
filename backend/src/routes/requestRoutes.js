import { Router } from "express";

import { create, getById, list } from "../controllers/requestController.js";
import { generate, getPlan } from "../controllers/planController.js";
import { getSimulation, run } from "../controllers/simulationController.js";
import { evaluate, getRisk } from "../controllers/riskController.js";
import { evaluatePolicy, getPolicy } from "../controllers/policyController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createRequestSchema,
  requestListQuerySchema,
  requestParamsSchema,
} from "../schemas/requestSchemas.js";
import { emptyPlanBodySchema } from "../schemas/planSchemas.js";
import { emptySimulationBodySchema } from "../schemas/simulationSchemas.js";
import { emptyRiskBodySchema } from "../schemas/riskSchemas.js";
import { emptyPolicyBodySchema } from "../schemas/policySchemas.js";

export const requestRouter = Router();

requestRouter.use(authenticate);
requestRouter.post("/", validate(createRequestSchema), create);
requestRouter.get("/", validateQuery(requestListQuerySchema), list);
requestRouter.post("/:id/plan", validateParams(requestParamsSchema), validate(emptyPlanBodySchema), generate);
requestRouter.get("/:id/plan", validateParams(requestParamsSchema), getPlan);
requestRouter.post("/:id/simulation", validateParams(requestParamsSchema), validate(emptySimulationBodySchema), run);
requestRouter.get("/:id/simulation", validateParams(requestParamsSchema), getSimulation);
requestRouter.post("/:id/risk", validateParams(requestParamsSchema), validate(emptyRiskBodySchema), evaluate);
requestRouter.get("/:id/risk", validateParams(requestParamsSchema), getRisk);
requestRouter.post("/:id/policy", validateParams(requestParamsSchema), validate(emptyPolicyBodySchema), evaluatePolicy);
requestRouter.get("/:id/policy", validateParams(requestParamsSchema), getPolicy);
requestRouter.get("/:id", validateParams(requestParamsSchema), getById);
