const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  registerValidationRules,
  loginValidationRules,
  validateInput,
} = require("../utils/validator");

router.post(
  "/register",
  registerValidationRules(),
  validateInput,
  authController.registerUser
);

router.post(
  "/login",
  loginValidationRules(),
  validateInput,
  authController.loginUser
);

router.get("/:id", authController.getUserById);

module.exports = router;
