const express = require("express");
require("dotenv").config({ path: "./.env" });
const router = express.Router();
const pool = require("../config/database");
const { AccessToken } = require("../utils/jwtTokens");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");

router.get("/", async (req, res) => {
  res.json({ mes: "Forgot your password" });
});

//sending a link to the user to reset password
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
  const token = AccessToken(user.rows[0].user_id, "9m");

  //generate a reset link
  const link = `http://localhost:3001/reset/${email}/${token}`;

  //send the link throught the  email to user, for changing password using nodemailer

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAILPSW,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Please click the link below, to reset your password!!",
    text: link,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  res.json({
    msg: "Please check your email, to reset your password!!",
    Link: link,
  });
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

          //Update password columns data

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
