const express = require("express");
const router = express.Router();
const {
  sendVerificationCode,
  verifyCodeAndSendLink,
  checkTokenValidity,
  resetPassword,
} = require("../controllers/forgotPasswordController");
const {
  resetPasswordValidationRules,
  validateInput,
} = require("../utils/validator");
const pool = require("../config/database");

// Middleware to check if user is active
const checkUserIsActive = async (req, res, next) => {
  try {
    const { email } = req.params;

    // Check if the user is active
    const userStatus = await pool.query(
      "SELECT status FROM users WHERE email = $1",
      [email]
    );

    if (
      userStatus.rows.length === 0 ||
      userStatus.rows[0].status !== "active"
    ) {
      return res.status(401).json({ error: "User is not active" });
    }

    // User is active, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Route: Sending a verification code to the user to reset the password
router.post("/", sendVerificationCode);

// Route: Check if the input for the random chars is matched, if matched, send the link to reset the password
router.post(
  "/reset/:email/:token/:generateRandomString",
  checkUserIsActive,
  verifyCodeAndSendLink
);

// Route: Check if the token is valid
router.get("/reset/:email/:token", checkTokenValidity);

// Route: Update password after checking the token expiration date and verification code
router.post(
  "/reset/:email/:token",
  checkUserIsActive,
  resetPasswordValidationRules(),
  validateInput,
  resetPassword
);

module.exports = router;
