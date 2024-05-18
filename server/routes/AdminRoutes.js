const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { checkUserRole } = require("../middlewares/roles");
const authenticateUser = require("../middlewares/authMiddleware");
const {
  registerValidationRules,
  validateInput,
} = require("../utils/validator");
// Get all users (accessible only to admins)
router.get(
  "/:id",
  authenticateUser,
  checkUserRole("admin"),
  adminController.getAllUsers
);

// Update user to become an admin (accessible only to admins)
router.put(
  "/assign-admin/:id",
  authenticateUser,
  checkUserRole("admin"),
  adminController.updateToAdmin
);
router.put(
  "/:id/profile",
  authenticateUser,
  checkUserRole("admin"),
  registerValidationRules(),
  validateInput,
  adminController.updateUserProfile
);
router.put(
  "/:id/password",
  authenticateUser,
  checkUserRole("admin"),
  registerValidationRules(),
  validateInput,
  adminController.changeUserPassword
);
router.delete(
  "/:id",
  authenticateUser,
  checkUserRole("admin"),
  registerValidationRules(),
  validateInput,
  adminController.deleteUserAccount
);

module.exports = router;
