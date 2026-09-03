import { generateOwnedPlan, getOwnedPlan } from "../services/planner/plannerService.js";

export async function generate(request, response) {
  const plan = await generateOwnedPlan(request.user.id, request.validatedParams.id);
  response.status(201).json({ plan });
}

export async function getPlan(request, response) {
  const plan = await getOwnedPlan(request.user.id, request.validatedParams.id);
  response.json({ plan });
}
