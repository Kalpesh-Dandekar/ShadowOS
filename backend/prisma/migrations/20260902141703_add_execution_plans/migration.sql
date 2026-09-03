-- CreateEnum
CREATE TYPE "PlannerProviderType" AS ENUM ('SIMULATION');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('GENERATED', 'INVALID');

-- CreateEnum
CREATE TYPE "PlanActionType" AS ENUM ('QUERY_RESOURCE', 'VALIDATE_SCOPE', 'CREATE_RESOURCE', 'UPDATE_RESOURCE', 'ARCHIVE_RESOURCE', 'DELETE_RESOURCE');

-- CreateEnum
CREATE TYPE "PlanResourceType" AS ENUM ('INVOICE', 'CUSTOMER_ACCOUNT', 'USER_ACCOUNT', 'FILE', 'RECORD');

-- CreateTable
CREATE TABLE "ExecutionPlan" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "provider" "PlannerProviderType" NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanAction" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "PlanActionType" NOT NULL,
    "resourceType" "PlanResourceType" NOT NULL,
    "description" TEXT NOT NULL,
    "target" JSONB NOT NULL,
    "destructive" BOOLEAN NOT NULL DEFAULT false,
    "reversible" BOOLEAN NOT NULL DEFAULT true,
    "estimatedScope" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionPlan_requestId_key" ON "ExecutionPlan"("requestId");

-- CreateIndex
CREATE INDEX "PlanAction_planId_idx" ON "PlanAction"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanAction_planId_position_key" ON "PlanAction"("planId", "position");

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAction" ADD CONSTRAINT "PlanAction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ExecutionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
