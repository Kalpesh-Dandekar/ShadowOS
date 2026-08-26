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
};

export async function registerUser({ name, email, password }) {
  const database = getDatabase();
  const existingUser = await database.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) throw new AppError(409, "AUTH_EMAIL_EXISTS", "An account with this email already exists");

  const passwordHash = await hashPassword(password);
  try {
    return await database.user.create({
      data: { name, email, passwordHash, role: "EMPLOYEE", status: "ACTIVE" },
      select: safeUserSelect,
    });
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
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export { safeUserSelect };
