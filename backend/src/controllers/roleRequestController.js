import {
  approveRoleRequest,
  listRoleRequests,
  rejectRoleRequest,
} from "../services/roleRequests/roleRequestService.js";

export async function list(request, response) {
  const roleRequests = await listRoleRequests(request.validatedQuery.status);
  response.json({ roleRequests });
}

export async function approve(request, response) {
  const roleRequest = await approveRoleRequest(request.validatedParams.id, request.user.id);
  response.json({ roleRequest });
}

export async function reject(request, response) {
  const roleRequest = await rejectRoleRequest(
    request.validatedParams.id,
    request.user.id,
    request.validatedBody.comment,
  );
  response.json({ roleRequest });
}
