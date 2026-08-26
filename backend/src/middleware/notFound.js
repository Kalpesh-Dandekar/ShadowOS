export function notFound(_request, response) {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Not found",
    },
  });
}
