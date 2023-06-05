const express = require("express");
const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const pool = require("../config/database");
const { RefreshToken, AccessToken } = require("../utils/jwtTokens");

require("dotenv").config();
const validateUserInput = require("../utils/inputValidationMiddleware");
const assignAdminRole = require("../middlewares/AssignAdminRole");
const checkUserRole = require("../middlewares/checkUserRole");
const checkAdminRole = require("../middlewares/checkAdminRole");

const router = express.Router();

// User registration route
router.post(
  "/register",
  [
    check("first_name").notEmpty().withMessage("First name is required"),
    check("last_name").notEmpty().withMessage("Last name is required"),
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
    const { first_name, last_name, email, password } = req.body;

    try {
      const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length !== 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
        [first_name, last_name, email, hashedPassword]
      );

      // Assign the default role 'user' to the registered user
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      const userId = user.rows[0].user_id;

      await pool.query(
        "INSERT INTO user_roles (user_id, role_name) VALUES ($1, 'user')",
        [userId]
      );

      res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
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
    const { email, password } = req.body;

    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length === 0) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.rows[0].password
      );

      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const userId = user.rows[0].user_id;
      const accessToken = AccessToken(userId);
      const refreshToken = RefreshToken(userId);

      const fullName = `${user.rows[0].first_name} ${user.rows[0].last_name}`;

      res.json({
        fullName,
        accessToken,
        refreshToken,
        message: "Login successful",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get user by ID route
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all users route
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user by ID route for admins only
router.get(
  "/admin/:userId",
  checkUserRole,
  checkAdminRole,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Retrieve the user with the specified userId
      const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
        userId,
      ]);

      if (!user.rows.length) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return the user data
      res.json(user.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Assign admin role to a user
router.put("/assign-admin/:userId", assignAdminRole, async (req, res) => {
  try {
    const { userId } = req.params;
    // Retrieve the updated user data from the request body
    const { firstName, lastName, email } = req.body;

    // Perform the update operation
    const result = await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE user_id = $4",
      [firstName, lastName, email, userId]
    );

    // Check if the update was successful
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return a success message
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
