export type PolicyDecision = "ALLOW" | "REQUIRE_APPROVAL" | "BLOCK";
export type PolicyMatch = { id: string; ruleKey: string; ruleName: string; decision: PolicyDecision; priority: number; observedFacts: Record<string, string | number | boolean | null>; explanation: string; createdAt: string };
export type PolicyEvaluation = { id: string; riskAssessmentId: string; decision: PolicyDecision; summary: string; evaluatedRuleCount: number; matchedRuleCount: number; matches: PolicyMatch[]; createdAt: string; updatedAt: string };
