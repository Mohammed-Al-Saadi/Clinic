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

// Route: Sending a verification code to the user to reset the password
router.post("/", sendVerificationCode);

// Route: Check if the input for the random chars is matched, if matched, send the link to reset the password
router.post(
  "/reset/:email/:token/:generateRandomString",
  verifyCodeAndSendLink
);

// Route: Check if the token is valid
router.get("/reset/:email/:token", checkTokenValidity);

// Route: Update password after checking the token expiration date and verification code
router.post(
  "/reset/:email/:token",
  resetPasswordValidationRules(),
  validateInput,
  resetPassword
);

module.exports = router;
