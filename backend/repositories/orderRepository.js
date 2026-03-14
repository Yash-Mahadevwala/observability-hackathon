const db = require("../config/database");

exports.createOrder = async (data) => {
  const order = await db.query(
    "INSERT INTO orders(user_id) VALUES($1) RETURNING *",
    [data.user_id]
  );

  const orderId = order.rows[0].id;

  for (let item of data.items) {
    await db.query(
      "INSERT INTO order_items(order_id,product_id,quantity) VALUES($1,$2,$3)",
      [orderId, item.product_id, item.quantity]
    );
  }

  return order.rows[0];
};

exports.getOrders = async () => {
  const result = await db.query("SELECT * FROM orders");
  return result.rows;
};