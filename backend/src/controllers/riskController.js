import { evaluateOwnedRisk, getOwnedRisk } from "../services/risk/riskService.js";

export async function evaluate(request, response) {
  const riskAssessment = await evaluateOwnedRisk(request.user.id, request.validatedParams.id);
  response.status(201).json({ riskAssessment });
}

export async function getRisk(request, response) {
  const riskAssessment = await getOwnedRisk(request.user.id, request.validatedParams.id);
  response.json({ riskAssessment });
}
