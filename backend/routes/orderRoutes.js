const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const validate = require("../middleware/validate");
const { createOrderSchema } = require("../validations/orderValidation");

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getOrders);

module.exports = router;