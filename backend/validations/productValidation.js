const { z } = require("zod");

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().int().nonnegative("Stock cannot be negative").default(10),
});

module.exports = {
  createProductSchema,
};
