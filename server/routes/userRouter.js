const express = require("express");
const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const pool = require("../config/database");
const { RefreshToken, AccessToken } = require("../utils/jwtTokens");

require("dotenv").config();
const validateUserInput = require("../utils/inputValidationMiddleware");

const router = express.Router();
// User registration route
router.post(
  "/register",
  [
    check("first_name").notEmpty().withMessage("Username is required"),
    check("last_name").notEmpty().withMessage("lastName is required"),
    check("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validateUserInput,
  async (req, res) => {
    // Handle user registration logic here
    const { first_name, last_name, email, password } = req.body;

    try {
      const user = await pool.query(`SELECT * FROM users WHERE email= $1;`, [
        email,
      ]); //Checking if user already exists
      if (user.rows.length != 0) {
        return res.status(400).json({
          error: "Username already taken.",
        });
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err)
            res.status(err).json({
              error: "Please check your password!!",
            });
          const user = {
            first_name,
            last_name,
            email,
            password: hash,
          };

          //Inserting data into the database

          pool.query(
            `INSERT INTO users (first_name, last_name, email, password) VALUES ($1,$2,$3,$4);`,
            [user.first_name, user.last_name, user.email, user.password],
            (err) => {
              try {
                res
                  .status(200)
                  .send({ message: "User registered successfully" });
              } catch (error) {
                console.error(error.message);
                res.status(500).send(" server error");
              }
            }
          );
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Please check your connection!", //Database connection error
      });
    }
  }
);

// User login route
router.post(
  "/login",
  [
    check("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  validateUserInput,
  async (req, res) => {
    // Handle user login logic here
    const { email, password } = req.body;
    try {
      const user = await pool.query(`SELECT * FROM users WHERE email= $1;`, [
        email,
      ]); //Verifying if the user exists in the database
      if (user.rows.length === 0) {
        res.status(400).json({
          error: "Invalid username or password",
        });
      } else {
        bcrypt.compare(password, user.rows[0].password, (err, result) => {
          //Comparing the hashed password
          if (err) {
            res.status(500).json({
              error: "Server error",
            });
          } else if (result === true) {
            //Checking if credentials match
            const Access_Token = AccessToken(user.rows[0].user_id);
            const Refresh_Token = RefreshToken(user.rows[0].user_id);
            const firstName = user.rows[0].first_name;
            const lastName = user.rows[0].last_name;
            const fullName = firstName.concat(" ", lastName);
            try {
              res.json({
                fullName,
                Access_Token,
                Refresh_Token,
                message: "Login successful",
              });
            } catch (error) {
              console.error(error.message);
              res.status(500).send("Server error");
            }
          } else {
            //Declaring the errors
            if (result != true)
              res.status(400).json({
                error: "Password or email is incorrect!",
              });
          }
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Server error!", //Database connection
      });
    }
  }
);

module.exports = router;
