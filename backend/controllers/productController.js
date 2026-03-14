const productService = require("../services/productService");

exports.createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.json(product);
};

exports.getProducts = async (req, res) => {
  const products = await productService.getProducts();
  res.json(products);
};

exports.deleteProduct = async (req, res) => {
  const deleted = await productService.deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted", product: deleted });
};