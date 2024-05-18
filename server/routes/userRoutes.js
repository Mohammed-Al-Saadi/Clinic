const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  registerValidationRules,
  loginValidationRules,
  validateInput,
} = require("../utils/validator");
const authenticateUser = require("../middlewares/authMiddleware");

router.post(
  "/register",
  registerValidationRules(),
  validateInput,
  userController.registerUser
);

router.post(
  "/login",
  loginValidationRules(),
  validateInput,
  userController.loginUser
);
router.put("/:id/profile", authenticateUser, userController.updateUserProfile);

// Change user password
router.put(
  "/:id/password",
  authenticateUser,
  validateInput,
  userController.changeUserPassword
);

router.get("/:id", authenticateUser, userController.getUserById);

module.exports = router;
