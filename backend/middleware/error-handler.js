function notFound(req, res) { res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} was not found.` }); }

function errorHandler(error, req, res, _next) {
  console.error(`[Express] ${req.method} ${req.originalUrl}`, error);
  const status = Number(error.status || error.statusCode) || 500;
  res.status(status).json({ message: status === 500 && process.env.NODE_ENV === "production" ? "Internal server error." : error.message, requestId: res.sentry || undefined });
}

module.exports = { notFound, errorHandler };
