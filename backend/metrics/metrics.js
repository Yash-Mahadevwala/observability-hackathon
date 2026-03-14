const client = require("prom-client")

const register = new client.Registry()

client.collectDefaultMetrics({
  register
})

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests",
  labelNames: ["method", "route", "status"],
  buckets: [50, 100, 200, 500, 1000]
})

const userCreatedTotal = new client.Counter({
  name: "user_created_total",
  help: "Total number of users created"
})

const productCreatedTotal = new client.Counter({
  name: "product_created_total",
  help: "Total number of products created"
})

const orderCreatedTotal = new client.Counter({
  name: "order_created_total",
  help: "Total number of orders created"
})

register.registerMetric(httpRequestDuration)
register.registerMetric(userCreatedTotal)
register.registerMetric(productCreatedTotal)
register.registerMetric(orderCreatedTotal)

module.exports = {
  register,
  httpRequestDuration,
  userCreatedTotal,
  productCreatedTotal,
  orderCreatedTotal
}