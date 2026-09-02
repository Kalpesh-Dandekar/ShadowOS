import { Router } from "express";

import { create, getById, list } from "../controllers/requestController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createRequestSchema,
  requestListQuerySchema,
  requestParamsSchema,
} from "../schemas/requestSchemas.js";

export const requestRouter = Router();

requestRouter.use(authenticate);
requestRouter.post("/", validate(createRequestSchema), create);
requestRouter.get("/", validateQuery(requestListQuerySchema), list);
requestRouter.get("/:id", validateParams(requestParamsSchema), getById);
