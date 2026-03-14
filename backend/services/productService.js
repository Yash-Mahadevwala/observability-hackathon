const productRepo = require("../repositories/productRepository");

exports.createProduct = async (data) => {
  return await productRepo.create(data);
};

exports.getProducts = async () => {
  return await productRepo.findAll();
};