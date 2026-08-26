import { getDatabase } from "../config/database.js";
import { environment } from "../config/environment.js";
import { AppError } from "../utils/appError.js";
import { verifySessionToken } from "../utils/auth/token.js";

export async function authenticate(request, _response, next) {
  const token = request.cookies?.[environment.cookieName];
  if (!token) return next(new AppError(401, "AUTH_UNAUTHORIZED", "Authentication required"));

  try {
    const payload = verifySessionToken(token);
    const user = await getDatabase().user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    if (!user || user.status !== "ACTIVE") {
      return next(new AppError(401, "AUTH_UNAUTHORIZED", "Authentication required"));
    }
    request.user = user;
    return next();
  } catch {
    return next(new AppError(401, "AUTH_UNAUTHORIZED", "Authentication required"));
  }
}
