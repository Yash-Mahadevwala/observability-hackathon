const { trace } = require("@opentelemetry/api");
const tracer = trace.getTracer("user-service");
const userRepo = require("../repositories/userRepository");
const { userCreatedTotal } = require("../metrics/metrics");

exports.createUser = async (data) => {
  return tracer.startActiveSpan("userService.createUser", async (span) => {
    try {
      const user = await userRepo.create(data);
      userCreatedTotal.inc();
      return user;
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};

exports.getUsers = async () => {
  return tracer.startActiveSpan("userService.getUsers", async (span) => {
    try {
      return await userRepo.findAll();
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};

exports.deleteUser = async (id) => {
  return tracer.startActiveSpan("userService.deleteUser", async (span) => {
    try {
      return await userRepo.deleteById(id);
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};