import { Role } from "@prisma/client";
import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

export const rbacRouter = Router();

function accessResponse(access) {
  return (request, response) => response.json({ access, role: request.user.role });
}

rbacRouter.get(
  "/authenticated",
  authenticate,
  authorize(Role.EMPLOYEE, Role.MANAGER, Role.ADMIN),
  accessResponse("authenticated"),
);
rbacRouter.get(
  "/manager",
  authenticate,
  authorize(Role.MANAGER, Role.ADMIN),
  accessResponse("manager"),
);
rbacRouter.get("/admin", authenticate, authorize(Role.ADMIN), accessResponse("admin"));
