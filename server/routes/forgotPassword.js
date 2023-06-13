const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const mailer = require("../utils/mailer");
const { AccessToken } = require("../utils/jwtTokens");
require("dotenv").config({ path: "./.env" });

// Sending a verification code to the user to reset the password
router.post("/", async (req, res) => {
  const { email } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email = $1;", [
    email,
  ]);

  // Checking if user does not exist
  if (!user.rows.length) {
    return res.status(200).json({
      msg: "The given email is not registered",
    });
  }

  // Generate a new token to reset the password and send it with the link (valid for one time use)
  const token = AccessToken(user.rows[0].user_id, "15m");

  // Generate a random string 'kxai4on2'
  const generateRandomString = Math.floor(Math.random() * Date.now()).toString(
    36
  );

  // Send the verification code through email to the user for changing the password using nodemailer
  const subject = "Please use the verification code to reset your password";
  mailer(email, generateRandomString, subject);

  res.json({
    msg: "Please check your email to reset your password! Note the code for the input code route",
    token: token,
  });
});

// Check if the input for the random chars is matched, if matched, send the link to reset the password
router.post("/reset/:email/:token/:generateRandomString", async (req, res) => {
  const { token, generateRandomString, email } = req.params;
  const { code } = req.body;

  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (verifyToken) {
      if (code !== generateRandomString || !code) {
        return res.json("Please check your verification code!");
      } else {
        const link = `http://localhost:3001/reset/${email}/${token}`;
        const subject = "Please click the link below to update your password!";
        // Send the link through email to the user for changing the password using nodemailer
        mailer(email, link, subject);

        res.json({
          msg: "Please check your email to reset your password! Note the route for resetting the password",
          link: link,
        });
      }
    }
  } catch (error) {
    res.json(error);
  }
});

// Check if the token is valid
router.get("/reset/:email/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (verifyToken) {
      return res.json({ verifyToken });
    }
  } catch (error) {
    res.json(error);
  }
});

// Update password after checking the token expiration date and verification code
router.post(
  "/reset/:email/:token",
  [
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],

  async (req, res) => {
    const { password, password1 } = req.body;
    const { token, email } = req.params;

    try {
      const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
      if (verifyToken) {
        if (password !== password1) {
          return res.json("Passwords do not match!");
        } else {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              return res.status(err).json({
                error: "Please check your password!",
              });
            }

            const user = {
              password: hash,
            };

            // Update the password
            pool.query("UPDATE users SET password = $1 WHERE email = $2", [
              user.password,
              email,
            ]);

            res.json("Password has been changed!");
          });
        }
      }
    } catch (error) {
      res.json(error);
    }
  }
);

module.exports = router;
