const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validate = require("../middleware/validate");
const { createUserSchema } = require("../validations/userValidation");

router.post("/", validate(createUserSchema), userController.createUser);
router.get("/", userController.getUsers);
router.delete("/:id", userController.deleteUser);

module.exports = router;