const { httpRequestDuration } = require("../metrics/metrics")

module.exports = (req, res, next) => {

  const start = Date.now()

  res.on("finish", () => {

    const duration = Date.now() - start

    httpRequestDuration
      .labels(req.method, req.route?.path || req.url, res.statusCode)
      .observe(duration)

  })

  next()
}