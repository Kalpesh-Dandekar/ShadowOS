import { getDatabase } from "../../config/database.js";
import { AppError } from "../../utils/appError.js";
import { hashPassword, verifyPassword } from "../../utils/auth/password.js";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  submittedRoleRequests: {
    where: { status: { in: ["PENDING", "REJECTED"] }, requestedRole: "MANAGER" },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: { requestedRole: true, status: true },
  },
};

export function toSafeUser(user) {
  const { submittedRoleRequests = [], ...safeUser } = user;
  return { ...safeUser, roleRequest: submittedRoleRequests[0] ?? null };
}

export async function createPendingManagerRequest(database, userId) {
  const existingPending = await database.roleRequest.findFirst({
    where: { userId, requestedRole: "MANAGER", status: "PENDING" },
    select: { id: true },
  });
  if (existingPending) {
    throw new AppError(409, "ROLE_REQUEST_PENDING", "A Manager access request is already pending");
  }
  return database.roleRequest.create({
    data: { userId, requestedRole: "MANAGER", status: "PENDING" },
  });
}

export async function registerUser({ name, email, password, requestedRole }) {
  const database = getDatabase();
  const existingUser = await database.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) throw new AppError(409, "AUTH_EMAIL_EXISTS", "An account with this email already exists");

  const passwordHash = await hashPassword(password);
  try {
    const user = await database.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: { name, email, passwordHash, role: "EMPLOYEE", status: "ACTIVE" },
        select: { id: true },
      });
      if (requestedRole === "MANAGER") {
        await createPendingManagerRequest(transaction, createdUser.id);
      }
      return transaction.user.findUniqueOrThrow({ where: { id: createdUser.id }, select: safeUserSelect });
    });
    return toSafeUser(user);
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(409, "AUTH_EMAIL_EXISTS", "An account with this email already exists");
    }
    throw error;
  }
}

export async function loginUser({ email, password }) {
  const database = getDatabase();
  const user = await database.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(401, "AUTH_INVALID_CREDENTIALS", "Invalid email or password");
  }
  if (user.status !== "ACTIVE") {
    throw new AppError(403, "AUTH_ACCOUNT_DISABLED", "Account is disabled");
  }
  const safeUser = await database.user.findUniqueOrThrow({ where: { id: user.id }, select: safeUserSelect });
  return toSafeUser(safeUser);
}

export { safeUserSelect };
