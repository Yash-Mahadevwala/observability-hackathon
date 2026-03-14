const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.json(order);
};

exports.getOrders = async (req, res) => {
  const orders = await orderService.getOrders();
  res.json(orders);
};

exports.deleteOrder = async (req, res) => {
  const deleted = await orderService.deleteOrder(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Order not found" });
  res.json({ message: "Order deleted", order: deleted });
};