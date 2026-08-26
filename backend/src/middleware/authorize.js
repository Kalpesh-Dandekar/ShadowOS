import { Role } from "@prisma/client";

import { AppError } from "../utils/appError.js";

const knownRoles = new Set(Object.values(Role));

export function authorize(...allowedRoles) {
  if (allowedRoles.length === 0 || allowedRoles.some((role) => !knownRoles.has(role))) {
    throw new TypeError("authorize requires one or more valid ShadowOS roles");
  }

  const allowedRoleSet = new Set(allowedRoles);

  return function authorizeRole(request, _response, next) {
    if (!request.user) {
      return next(new AppError(401, "AUTH_UNAUTHORIZED", "Authentication required"));
    }

    if (!allowedRoleSet.has(request.user.role)) {
      return next(
        new AppError(403, "AUTH_FORBIDDEN", "You do not have permission to perform this action"),
      );
    }

    return next();
  };
}
