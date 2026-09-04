-- CreateEnum
CREATE TYPE "ExecutionProviderType" AS ENUM ('SYNTHETIC');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "ExecutionActionStatus" AS ENUM ('COMPLETED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('EXECUTION_STARTED', 'EXECUTION_COMPLETED', 'EXECUTION_FAILED', 'ROLLBACK_STARTED', 'ROLLBACK_COMPLETED', 'ROLLBACK_FAILED');

-- CreateEnum
CREATE TYPE "RollbackStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ExecutionRun" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "simulationRunId" UUID NOT NULL,
    "riskAssessmentId" UUID NOT NULL,
    "policyEvaluationId" UUID NOT NULL,
    "approvalRequestId" UUID,
    "actorUserId" UUID NOT NULL,
    "provider" "ExecutionProviderType" NOT NULL DEFAULT 'SYNTHETIC',
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "summary" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionActionResult" (
    "id" UUID NOT NULL,
    "executionRunId" UUID NOT NULL,
    "planActionId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "actionType" "PlanActionType" NOT NULL,
    "resourceType" "PlanResourceType" NOT NULL,
    "status" "ExecutionActionStatus" NOT NULL DEFAULT 'COMPLETED',
    "matchedCount" INTEGER NOT NULL,
    "affectedCount" INTEGER NOT NULL,
    "reversible" BOOLEAN NOT NULL,
    "summary" TEXT NOT NULL,
    "beforeJson" JSONB NOT NULL,
    "afterJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionActionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "actorUserId" UUID,
    "eventType" "AuditEventType" NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" UUID,
    "message" TEXT NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RollbackRun" (
    "id" UUID NOT NULL,
    "executionRunId" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "status" "RollbackStatus" NOT NULL DEFAULT 'RUNNING',
    "summary" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RollbackRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RollbackActionResult" (
    "id" UUID NOT NULL,
    "rollbackRunId" UUID NOT NULL,
    "executionActionResultId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "ExecutionActionStatus" NOT NULL DEFAULT 'ROLLED_BACK',
    "restoredJson" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RollbackActionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionRun_requestId_key" ON "ExecutionRun"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionRun_planId_key" ON "ExecutionRun"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionRun_simulationRunId_key" ON "ExecutionRun"("simulationRunId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionRun_riskAssessmentId_key" ON "ExecutionRun"("riskAssessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionRun_policyEvaluationId_key" ON "ExecutionRun"("policyEvaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionRun_approvalRequestId_key" ON "ExecutionRun"("approvalRequestId");

-- CreateIndex
CREATE INDEX "ExecutionRun_actorUserId_createdAt_idx" ON "ExecutionRun"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ExecutionRun_status_idx" ON "ExecutionRun"("status");

-- CreateIndex
CREATE INDEX "ExecutionActionResult_planActionId_idx" ON "ExecutionActionResult"("planActionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionActionResult_executionRunId_planActionId_key" ON "ExecutionActionResult"("executionRunId", "planActionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionActionResult_executionRunId_position_key" ON "ExecutionActionResult"("executionRunId", "position");

-- CreateIndex
CREATE INDEX "AuditEvent_requestId_createdAt_idx" ON "AuditEvent"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_createdAt_idx" ON "AuditEvent"("eventType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RollbackRun_executionRunId_key" ON "RollbackRun"("executionRunId");

-- CreateIndex
CREATE INDEX "RollbackRun_actorUserId_createdAt_idx" ON "RollbackRun"("actorUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RollbackActionResult_rollbackRunId_executionActionResultId_key" ON "RollbackActionResult"("rollbackRunId", "executionActionResultId");

-- CreateIndex
CREATE UNIQUE INDEX "RollbackActionResult_rollbackRunId_position_key" ON "RollbackActionResult"("rollbackRunId", "position");

-- AddForeignKey
ALTER TABLE "ExecutionRun" ADD CONSTRAINT "ExecutionRun_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionRun" ADD CONSTRAINT "ExecutionRun_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ExecutionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionRun" ADD CONSTRAINT "ExecutionRun_simulationRunId_fkey" FOREIGN KEY ("simulationRunId") REFERENCES "SimulationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionRun" ADD CONSTRAINT "ExecutionRun_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionRun" ADD CONSTRAINT "ExecutionRun_policyEvaluationId_fkey" FOREIGN KEY ("policyEvaluationId") REFERENCES "PolicyEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionRun" ADD CONSTRAINT "ExecutionRun_approvalRequestId_fkey" FOREIGN KEY ("approvalRequestId") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionRun" ADD CONSTRAINT "ExecutionRun_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionActionResult" ADD CONSTRAINT "ExecutionActionResult_executionRunId_fkey" FOREIGN KEY ("executionRunId") REFERENCES "ExecutionRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionActionResult" ADD CONSTRAINT "ExecutionActionResult_planActionId_fkey" FOREIGN KEY ("planActionId") REFERENCES "PlanAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollbackRun" ADD CONSTRAINT "RollbackRun_executionRunId_fkey" FOREIGN KEY ("executionRunId") REFERENCES "ExecutionRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollbackRun" ADD CONSTRAINT "RollbackRun_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollbackActionResult" ADD CONSTRAINT "RollbackActionResult_rollbackRunId_fkey" FOREIGN KEY ("rollbackRunId") REFERENCES "RollbackRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollbackActionResult" ADD CONSTRAINT "RollbackActionResult_executionActionResultId_fkey" FOREIGN KEY ("executionActionResultId") REFERENCES "ExecutionActionResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
