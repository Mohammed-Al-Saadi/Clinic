const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const mailer = require("../utils/mailer");
const { AccessToken } = require("../utils/jwtTokens");
require("dotenv").config({ path: "./.env" });

// Sending a verification code to the user to reset the password
exports.sendVerificationCode = async (req, res) => {
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
};

// Check if the input verification code is matched, if matched, send the link to reset the password
exports.verifyCodeAndSendLink = async (req, res) => {
  const { token, generateRandomString, email } = req.params;
  const { code } = req.body;
  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (verifyToken) {
      if (code !== generateRandomString || !code) {
        return res.json("Please check your verification code!");
      } else {
        const link = `http://localhost:3001/forgot-password/reset/${email}/${token}`;
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
};

// Check if the token is valid
exports.checkTokenValidity = async (req, res) => {
  const { token } = req.params;
  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (verifyToken) {
      return res.json({ verifyToken });
    }
  } catch (error) {
    res.json(error);
  }
};

// Update password after checking the token expiration date and verification code
exports.resetPassword = async (req, res) => {
  const { password, confirm_pass } = req.body;
  const { token, email } = req.params;

  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (verifyToken) {
      if (password !== confirm_pass) {
        res.json("Passwords should be match!");
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(err).json({
              error: "Please check your password!",
            });
          }

          // Update the password
          pool.query("UPDATE users SET password = $1 WHERE email = $2", [
            hash,
            email,
          ]);

          res.json("Password has been changed!");
        });
      }
    }
  } catch (error) {
    res.json(error);
  }
};
