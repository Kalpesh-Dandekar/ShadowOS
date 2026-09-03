-- CreateEnum
CREATE TYPE "PolicyDecision" AS ENUM ('ALLOW', 'REQUIRE_APPROVAL', 'BLOCK');

-- CreateTable
CREATE TABLE "PolicyEvaluation" (
    "id" UUID NOT NULL,
    "riskAssessmentId" UUID NOT NULL,
    "decision" "PolicyDecision" NOT NULL,
    "summary" TEXT NOT NULL,
    "evaluatedRuleCount" INTEGER NOT NULL,
    "matchedRuleCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyMatch" (
    "id" UUID NOT NULL,
    "policyEvaluationId" UUID NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "decision" "PolicyDecision" NOT NULL,
    "priority" INTEGER NOT NULL,
    "observedFacts" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyEvaluation_riskAssessmentId_key" ON "PolicyEvaluation"("riskAssessmentId");

-- CreateIndex
CREATE INDEX "PolicyMatch_policyEvaluationId_idx" ON "PolicyMatch"("policyEvaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyMatch_policyEvaluationId_ruleKey_key" ON "PolicyMatch"("policyEvaluationId", "ruleKey");

-- AddForeignKey
ALTER TABLE "PolicyEvaluation" ADD CONSTRAINT "PolicyEvaluation_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyMatch" ADD CONSTRAINT "PolicyMatch_policyEvaluationId_fkey" FOREIGN KEY ("policyEvaluationId") REFERENCES "PolicyEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
