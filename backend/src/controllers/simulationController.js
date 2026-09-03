import { getOwnedSimulation, runOwnedSimulation } from "../services/simulation/simulationService.js";

export async function run(request, response) {
  const simulation = await runOwnedSimulation(request.user.id, request.validatedParams.id);
  response.status(201).json({ simulation });
}

export async function getSimulation(request, response) {
  const simulation = await getOwnedSimulation(request.user.id, request.validatedParams.id);
  response.json({ simulation });
}
