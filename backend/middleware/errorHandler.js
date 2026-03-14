const logger = require("../config/logger");
const { trace, context } = require("@opentelemetry/api");

const errorHandler = (err, req, res, next) => {
  const span = trace.getSpan(context.active());
  const traceId = span ? span.spanContext().traceId : null;

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  logger.error({
    msg: "Global error handler caught",
    error: err.message,
    stack: err.stack,
    status,
    traceId
  });

  res.status(status).json({
    message,
    errors: err.errors || null
  });
};

module.exports = errorHandler;
