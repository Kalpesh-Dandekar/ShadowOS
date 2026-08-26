import { AppError } from "../utils/appError.js";

export function errorHandler(error, _request, response, _next) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Unhandled API error: ${message}`);
  return response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
}
