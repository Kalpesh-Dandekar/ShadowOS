import { evaluateOwnedPolicy, getOwnedPolicy } from "../services/policy/policyService.js";

export async function evaluatePolicy(request, response) {
  response.status(201).json({ policyEvaluation: await evaluateOwnedPolicy(request.user.id, request.validatedParams.id) });
}

export async function getPolicy(request, response) {
  response.json({ policyEvaluation: await getOwnedPolicy(request.user.id, request.validatedParams.id) });
}
