const logger = require("../config/logger")
const { trace, context } = require("@opentelemetry/api")

module.exports = (req, res, next) => {
  const span = trace.getSpan(context.active())
  const traceId = span ? span.spanContext().traceId : null

  logger.info({
    method: req.method,
    url: req.url,
    traceId: traceId
  })

  next()
}