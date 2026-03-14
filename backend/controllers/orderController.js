const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.json(order);
};

exports.getOrders = async (req, res) => {
  const orders = await orderService.getOrders();
  res.json(orders);
};