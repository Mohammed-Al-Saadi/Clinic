const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { checkUserRole } = require("../middlewares/roles");
const authenticateUser = require("../middlewares/authMiddleware");
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

module.exports = router;
