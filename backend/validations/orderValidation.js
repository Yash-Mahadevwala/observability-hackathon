const { z } = require("zod");

const createOrderSchema = z.object({
  user_id: z.number().int().positive("A valid user_id is required"),
  items: z.array(
    z.object({
      product_id: z.number().int().positive("Product ID must be valid"),
      quantity: z.number().int().positive("Quantity must be at least 1"),
    })
  ).nonempty("Order must contain at least one item"),
});

module.exports = {
  createOrderSchema,
};
