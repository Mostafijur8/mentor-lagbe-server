// Converts thrown API errors into consistent JSON responses.
export function errorHandler(error, _req, res, _next) {
  console.error(error);
  const status = error.status || error.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? "An unexpected server error occurred." : error.message,
  });
}
