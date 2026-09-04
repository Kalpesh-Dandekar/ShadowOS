import { getDatabase } from "../../config/database.js";
import { AppError } from "../../utils/appError.js";

export function auditData(requestId, actorUserId, eventType, sourceType, sourceId, message, metadataJson) {
  return { requestId, actorUserId, eventType, sourceType, sourceId, message, ...(metadataJson ? { metadataJson } : {}) };
}

export async function listOwnedAudit(userId, requestId) {
  const request = await getDatabase().request.findFirst({ where: { id: requestId, userId }, select: { id: true } });
  if (!request) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  return getDatabase().auditEvent.findMany({ where: { requestId }, include: { actor: { select: { id: true, name: true, email: true, role: true } } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
}
