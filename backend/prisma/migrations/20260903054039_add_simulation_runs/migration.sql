-- CreateEnum
CREATE TYPE "SimulationProviderType" AS ENUM ('SYNTHETIC');

-- CreateEnum
CREATE TYPE "SimulationStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SimulationEffectType" AS ENUM ('ARCHIVE_RESOURCE', 'DELETE_RESOURCE');

-- CreateTable
CREATE TABLE "SimulationRun" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "provider" "SimulationProviderType" NOT NULL,
    "status" "SimulationStatus" NOT NULL DEFAULT 'COMPLETED',
    "totalResourcesExamined" INTEGER NOT NULL,
    "matchedResources" INTEGER NOT NULL,
    "affectedResources" INTEGER NOT NULL,
    "dependencyObservations" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationEffect" (
    "id" UUID NOT NULL,
    "simulationRunId" UUID NOT NULL,
    "planActionId" UUID NOT NULL,
    "resourceKey" TEXT NOT NULL,
    "resourceType" "PlanResourceType" NOT NULL,
    "effectType" "SimulationEffectType" NOT NULL,
    "beforeState" JSONB NOT NULL,
    "afterState" JSONB NOT NULL,
    "changed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationEffect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SimulationRun_planId_key" ON "SimulationRun"("planId");

-- CreateIndex
CREATE INDEX "SimulationEffect_simulationRunId_idx" ON "SimulationEffect"("simulationRunId");

-- CreateIndex
CREATE INDEX "SimulationEffect_planActionId_idx" ON "SimulationEffect"("planActionId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationEffect_simulationRunId_planActionId_resourceKey_key" ON "SimulationEffect"("simulationRunId", "planActionId", "resourceKey");

-- AddForeignKey
ALTER TABLE "SimulationRun" ADD CONSTRAINT "SimulationRun_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ExecutionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationEffect" ADD CONSTRAINT "SimulationEffect_simulationRunId_fkey" FOREIGN KEY ("simulationRunId") REFERENCES "SimulationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationEffect" ADD CONSTRAINT "SimulationEffect_planActionId_fkey" FOREIGN KEY ("planActionId") REFERENCES "PlanAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
