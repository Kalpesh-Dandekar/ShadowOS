import { z } from "zod";
import { POLICY_RULE_KEYS, POLICY_RULES } from "../services/policy/policyRules.js";

const decision = z.enum(["ALLOW", "REQUIRE_APPROVAL", "BLOCK"]);
export const policyMatchCandidateSchema = z.object({
  ruleKey: z.enum(POLICY_RULE_KEYS), ruleName: z.string().min(1).max(120), decision,
  priority: z.number().int().min(0).max(1000), observedFacts: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  explanation: z.string().min(1).max(500),
}).strict();
export const policyEvaluationCandidateSchema = z.object({
  decision, summary: z.string().min(1).max(1000), evaluatedRuleCount: z.number().int().positive(),
  matchedRuleCount: z.number().int().nonnegative(), matches: z.array(policyMatchCandidateSchema),
}).strict().superRefine((value, context) => {
  if (value.matchedRuleCount !== value.matches.length) context.addIssue({ code: "custom", path: ["matchedRuleCount"], message: "Matched rule count is inconsistent" });
  if (value.evaluatedRuleCount !== POLICY_RULE_KEYS.length) context.addIssue({ code: "custom", path: ["evaluatedRuleCount"], message: "Evaluated rule count is inconsistent" });
  if (new Set(value.matches.map((match) => match.ruleKey)).size !== value.matches.length) context.addIssue({ code: "custom", path: ["matches"], message: "Matched rules must be unique" });
  const registry = new Map(POLICY_RULES.map((rule) => [rule.key, rule]));
  value.matches.forEach((match, index) => {
    const registered = registry.get(match.ruleKey);
    if (!registered || registered.name !== match.ruleName || registered.decision !== match.decision || registered.priority !== match.priority) context.addIssue({ code: "custom", path: ["matches", index], message: "Matched rule metadata is inconsistent with the registry" });
  });
  const precedence = { ALLOW: 1, REQUIRE_APPROVAL: 2, BLOCK: 3 };
  const resolved = value.matches.reduce((current, match) => precedence[match.decision] > precedence[current] ? match.decision : current, "ALLOW");
  if (value.decision !== resolved) context.addIssue({ code: "custom", path: ["decision"], message: "Final decision is inconsistent with matched-rule precedence" });
});
export const emptyPolicyBodySchema = z.preprocess((value) => value ?? {}, z.object({}).strict());
