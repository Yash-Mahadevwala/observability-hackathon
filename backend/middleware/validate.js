const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = (err.errors || err.issues || []).map((e) => ({
        field: e.path ? e.path.join(".") : "unknown",
        message: e.message || "Invalid value",
      }));
      return res.status(400).json({
        message: "Validation Error",
        errors,
      });
    }
    next(err);
  }
};

module.exports = validate;
