const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const validate = require("../middleware/validate");
const { createProductSchema } = require("../validations/productValidation");

router.post("/", validate(createProductSchema), productController.createProduct);
router.get("/", productController.getProducts);
router.delete("/:id", productController.deleteProduct);

module.exports = router;