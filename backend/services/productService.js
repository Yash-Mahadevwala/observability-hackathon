const { trace } = require("@opentelemetry/api");
const tracer = trace.getTracer("product-service");
const productRepo = require("../repositories/productRepository");
const { productCreatedTotal } = require("../metrics/metrics");

exports.createProduct = async (data) => {
  return tracer.startActiveSpan("productService.createProduct", async (span) => {
    try {
      const product = await productRepo.create(data);
      productCreatedTotal.inc();
      return product;
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};

exports.getProducts = async () => {
  return tracer.startActiveSpan("productService.getProducts", async (span) => {
    try {
      return await productRepo.findAll();
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};

exports.deleteProduct = async (id) => {
  return tracer.startActiveSpan("productService.deleteProduct", async (span) => {
    try {
      return await productRepo.deleteById(id);
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};