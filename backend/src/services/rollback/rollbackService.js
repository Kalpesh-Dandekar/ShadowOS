import { getDatabase } from "../../config/database.js";
import { AppError } from "../../utils/appError.js";
import { auditData } from "../audit/auditService.js";

function rollbackInclude() { return { actor: { select: { id: true, name: true, email: true, role: true } }, actionResults: { orderBy: { position: "asc" } } }; }
export async function rollbackOwnedExecution(userId, executionId) {
  const execution = await getDatabase().executionRun.findFirst({ where: { id: executionId, request: { userId } }, include: { actionResults: { orderBy: { position: "asc" } }, rollbackRun: { include: rollbackInclude() } } });
  if (!execution) throw new AppError(404, "EXECUTION_NOT_FOUND", "Execution run not found");
  if (execution.rollbackRun?.status === "COMPLETED") return execution.rollbackRun;
  if (execution.status !== "COMPLETED") throw new AppError(409, execution.status === "ROLLED_BACK" ? "ROLLBACK_ALREADY_COMPLETED" : "ROLLBACK_NOT_AVAILABLE", "Rollback is not available for this execution");
  const mutations = execution.actionResults.filter((result) => result.affectedCount > 0);
  if (!mutations.length || mutations.some((result) => !result.reversible)) throw new AppError(409, "ROLLBACK_NOT_AVAILABLE", "A full safe rollback is not available");
  try {
    return await getDatabase().$transaction(async (tx) => {
      const rollback = await tx.rollbackRun.create({ data: { executionRunId: execution.id, actorUserId: userId, status: "RUNNING", summary: "Synthetic rollback is running." } });
      await tx.auditEvent.create({ data: auditData(execution.requestId, userId, "ROLLBACK_STARTED", "ROLLBACK", rollback.id, "Synthetic rollback started.") });
      await tx.rollbackActionResult.createMany({ data: mutations.map((result) => ({ rollbackRunId: rollback.id, executionActionResultId: result.id, position: result.position, status: "ROLLED_BACK", restoredJson: result.beforeJson, summary: `Restored ${result.affectedCount} isolated synthetic resources to persisted before-state.` })) });
      await tx.executionActionResult.updateMany({ where: { id: { in: mutations.map((result) => result.id) } }, data: { status: "ROLLED_BACK" } });
      await tx.executionRun.update({ where: { id: execution.id }, data: { status: "ROLLED_BACK", rolledBackAt: new Date() } });
      await tx.rollbackRun.update({ where: { id: rollback.id }, data: { status: "COMPLETED", completedAt: new Date(), summary: "Synthetic rollback completed; original execution evidence was preserved." } });
      await tx.auditEvent.create({ data: auditData(execution.requestId, userId, "ROLLBACK_COMPLETED", "ROLLBACK", rollback.id, "Synthetic rollback completed.", { restoredActionCount: mutations.length }) });
      return tx.rollbackRun.findUnique({ where: { id: rollback.id }, include: rollbackInclude() });
    });
  } catch (error) {
    if (error.code === "P2002") return getDatabase().rollbackRun.findUnique({ where: { executionRunId: execution.id }, include: rollbackInclude() });
    throw error;
  }
}
export async function getOwnedRollback(userId, executionId) { const execution = await getDatabase().executionRun.findFirst({ where: { id: executionId, request: { userId } }, select: { id: true } }); if (!execution) throw new AppError(404, "EXECUTION_NOT_FOUND", "Execution run not found"); const rollback = await getDatabase().rollbackRun.findUnique({ where: { executionRunId: executionId }, include: rollbackInclude() }); if (!rollback) throw new AppError(404, "ROLLBACK_NOT_FOUND", "Rollback run not found"); return rollback; }
