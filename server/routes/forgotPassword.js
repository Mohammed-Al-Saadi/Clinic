const express = require("express");
require("dotenv").config({ path: "./.env" });
const router = express.Router();
const pool = require("../config/database");
const { AccessToken } = require("../utils/jwtTokens");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailer = require("../utils/mailer");

router.get("/", async (req, res) => {
  res.json({ mes: "Forgot your password" });
});

//sending a verification code to the user to reset password
router.post("/", async (req, res) => {
  const { email } = req.body;
  const user = await pool.query(`SELECT * FROM users WHERE email= $1 ;`, [
    email,
  ]);

  //Checking if user not exists
  if (!user.rows.length != 0) {
    return res.status(200).json({
      msg: "The given email is not registered",
    });
  }
  //generate new token to reset password and send it with the link. link will be valid to use only one time.
  const token = AccessToken(user.rows[0].user_id, "1m");

  //generate random numbers
  const generateRandomString = Math.floor(Math.random() * Date.now()).toString(
    36
  );
  console.log(generateRandomString);
  //send the link throught the  email to user, for changing password using nodemailer
  const subject = "Please copy the verification code, to rest your password";
  mailer(email, generateRandomString, subject);
  res.json({
    msg: "Please check your email, to reset your password!! Note render to input code route",
    Token: token,
  });
});

// send random Char  'kxai4on2' to user email, to verify reset password
router.post("/reset/:email/:token/:generateRandomString", async (req, res) => {
  const { token, generateRandomString, email } = req.params;
  const { code } = req.body;

  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (verifyToken) {
      if (code != generateRandomString || !code) {
        return res.json("Please check your verification code!");
      }
      //send the link here to reset password
      else {
        const link = `http://localhost:3001/reset/${email}/${token}/${generateRandomString}`;
        const subject1 = "Reset password link has been sent to your email!";
        mailer(email, link, subject1);

        res.json({
          msg: "Please check your email, to reset your password!! Note render to input code route",
          Link: link,
        });
      }
    }
  } catch (error) {
    res.json(error);
  }
});

//check if token is valid route
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

//update password after checking the token expdate route
router.post("/reset/:email/:token", async (req, res) => {
  const { password, password1 } = req.body;
  const { token, email } = req.params;

  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (verifyToken) {
      if (password != password1 || !password || !password1) {
        return res.json("Password should be match!!");
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err)
            res.status(err).json({
              error: "Please check your password!!",
            });
          const user = {
            password: hash,
          };

          //Update password data

          pool.query(
            "UPDATE users SET password = $1 WHERE email = $2",
            [user.password, email],
            (err) => {
              try {
                res
                  .status(200)
                  .send({ message: "Password has been changed!!" });
              } catch (error) {
                console.error(error.message);
                res.status(500).send(" server error");
              }
            }
          );
        });
      }
    }
  } catch (error) {
    res.json(error);
  }
});
module.exports = router;
