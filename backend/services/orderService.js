const { trace } = require("@opentelemetry/api")
const tracer = trace.getTracer("order-service")
const orderRepo = require("../repositories/orderRepository");

exports.createOrder = async (data) => {
  return tracer.startActiveSpan("create-order", async (span) => {
    const order = await orderRepo.createOrder(data)
    span.end()
    return order
  })
}

exports.getOrders = async () => {
  return await orderRepo.getOrders();
};