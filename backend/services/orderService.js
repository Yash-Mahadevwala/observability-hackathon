const { trace } = require("@opentelemetry/api")
const tracer = trace.getTracer("order-service")
const orderRepo = require("../repositories/orderRepository");
const { orderCreatedTotal } = require("../metrics/metrics");

exports.createOrder = async (data) => {
  return tracer.startActiveSpan("orderService.createOrder", async (span) => {
    try {
      const order = await orderRepo.createOrder(data)
      orderCreatedTotal.inc();
      return order
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  })
}

exports.getOrders = async () => {
  return tracer.startActiveSpan("orderService.getOrders", async (span) => {
    try {
      return await orderRepo.getOrders();
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};

exports.deleteOrder = async (id) => {
  return tracer.startActiveSpan("orderService.deleteOrder", async (span) => {
    try {
      return await orderRepo.deleteById(id);
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};