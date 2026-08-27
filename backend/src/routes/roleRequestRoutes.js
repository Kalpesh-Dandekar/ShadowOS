import { Role } from "@prisma/client";
import { Router } from "express";

import { approve, list, reject } from "../controllers/roleRequestController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.js";
import {
  rejectRoleRequestSchema,
  roleRequestParamsSchema,
  roleRequestQuerySchema,
} from "../schemas/roleRequestSchemas.js";

export const roleRequestRouter = Router();

roleRequestRouter.use(authenticate, authorize(Role.ADMIN));
roleRequestRouter.get("/", validateQuery(roleRequestQuerySchema), list);
roleRequestRouter.post("/:id/approve", validateParams(roleRequestParamsSchema), approve);
roleRequestRouter.post(
  "/:id/reject",
  validateParams(roleRequestParamsSchema),
  validate(rejectRoleRequestSchema),
  reject,
);
