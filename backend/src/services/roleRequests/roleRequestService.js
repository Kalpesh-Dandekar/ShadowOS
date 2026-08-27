import { getDatabase } from "../../config/database.js";
import { AppError } from "../../utils/appError.js";

const safeRoleRequestSelect = {
  id: true,
  requestedRole: true,
  status: true,
  reviewComment: true,
  createdAt: true,
  reviewedAt: true,
  user: { select: { id: true, name: true, email: true, role: true, status: true } },
  reviewedBy: { select: { id: true, name: true } },
};

export function listRoleRequests(status = "PENDING") {
  return getDatabase().roleRequest.findMany({
    where: { status },
    orderBy: { createdAt: "asc" },
    select: safeRoleRequestSelect,
  });
}

function assertReviewable(roleRequest, reviewerId) {
  if (!roleRequest) throw new AppError(404, "ROLE_REQUEST_NOT_FOUND", "Role request not found");
  if (roleRequest.userId === reviewerId) {
    throw new AppError(403, "ROLE_REQUEST_SELF_REVIEW", "You cannot review your own role request");
  }
  if (roleRequest.status !== "PENDING") {
    throw new AppError(409, "ROLE_REQUEST_RESOLVED", "Role request has already been resolved");
  }
  if (roleRequest.requestedRole !== "MANAGER") {
    throw new AppError(409, "ROLE_REQUEST_INVALID_ROLE", "Role request cannot be approved");
  }
}

export async function approveRoleRequest(id, reviewerId) {
  const database = getDatabase();
  return database.$transaction(async (transaction) => {
    const roleRequest = await transaction.roleRequest.findUnique({ where: { id } });
    assertReviewable(roleRequest, reviewerId);
    const resolved = await transaction.roleRequest.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "APPROVED", reviewedById: reviewerId, reviewedAt: new Date() },
    });
    if (resolved.count !== 1) {
      throw new AppError(409, "ROLE_REQUEST_RESOLVED", "Role request has already been resolved");
    }
    await transaction.user.update({ where: { id: roleRequest.userId }, data: { role: "MANAGER" } });
    return transaction.roleRequest.findUniqueOrThrow({ where: { id }, select: safeRoleRequestSelect });
  });
}

export async function rejectRoleRequest(id, reviewerId, reviewComment) {
  const database = getDatabase();
  return database.$transaction(async (transaction) => {
    const roleRequest = await transaction.roleRequest.findUnique({ where: { id } });
    assertReviewable(roleRequest, reviewerId);
    const resolved = await transaction.roleRequest.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "REJECTED", reviewedById: reviewerId, reviewedAt: new Date(), reviewComment },
    });
    if (resolved.count !== 1) {
      throw new AppError(409, "ROLE_REQUEST_RESOLVED", "Role request has already been resolved");
    }
    return transaction.roleRequest.findUniqueOrThrow({ where: { id }, select: safeRoleRequestSelect });
  });
}

export { safeRoleRequestSelect };
