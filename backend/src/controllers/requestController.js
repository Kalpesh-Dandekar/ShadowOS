import {
  createRequest,
  getUserRequestById,
  listUserRequests,
} from "../services/requests/requestService.js";

export async function create(request, response) {
  const createdRequest = await createRequest(request.user.id, request.validatedBody);
  response.status(201).json({ request: createdRequest });
}

export async function list(request, response) {
  response.json(await listUserRequests(request.user.id, request.validatedQuery));
}

export async function getById(request, response) {
  const shadowRequest = await getUserRequestById(request.user.id, request.validatedParams.id);
  response.json({ request: shadowRequest });
}
