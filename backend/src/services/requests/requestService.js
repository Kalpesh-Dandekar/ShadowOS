import { getDatabase } from "../../config/database.js";
import { AppError } from "../../utils/appError.js";

const safeRequestSelect = {
  id: true,
  prompt: true,
  status: true,
  environment: true,
  createdAt: true,
  updatedAt: true,
};

export function createRequest(userId, { prompt, environment }) {
  return getDatabase().request.create({
    data: { userId, prompt, environment, status: "SUBMITTED" },
    select: safeRequestSelect,
  });
}

export async function listUserRequests(userId, { page, limit }) {
  const database = getDatabase();
  const where = { userId };
  const [requests, total] = await database.$transaction([
    database.request.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: safeRequestSelect,
    }),
    database.request.count({ where }),
  ]);
  return {
    requests,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserRequestById(userId, id) {
  const request = await getDatabase().request.findFirst({
    where: { id, userId },
    select: safeRequestSelect,
  });
  if (!request) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  return request;
}

export { safeRequestSelect };
