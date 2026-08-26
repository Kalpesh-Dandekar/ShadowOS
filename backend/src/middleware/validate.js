import { AppError } from "../utils/appError.js";

export function validate(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));
      return next(new AppError(400, "VALIDATION_ERROR", "Request validation failed", details));
    }
    request.validatedBody = result.data;
    return next();
  };
}
