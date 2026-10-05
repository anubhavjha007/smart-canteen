function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error('Unhandled server error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
