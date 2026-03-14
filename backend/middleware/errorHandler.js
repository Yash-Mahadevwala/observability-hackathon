const errorHandler = (err, req, res, next) => {
  console.error("Global error handler caught:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    message,
    errors: err.errors || null // Included for custom error payloads if necessary
  });
};

module.exports = errorHandler;
