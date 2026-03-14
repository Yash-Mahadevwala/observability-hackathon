const productService = require("../services/productService");

exports.createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.json(product);
};

exports.getProducts = async (req, res) => {
  const products = await productService.getProducts();
  res.json(products);
};