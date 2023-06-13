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

      // Retrieve the role_id and role_name for the 'user' role
      const roleQuery = await pool.query(
        "SELECT * FROM roles WHERE role_name = $1",
        ["user"]
      );
      const roleId = roleQuery.rows[0].role_id;
      const roleName = roleQuery.rows[0].role_name;

      // Insert the user role into the user_roles table
      await pool.query(
        "INSERT INTO user_roles (user_id, role_id, role_name) VALUES ($1, $2, $3)",
        [userId, roleId, roleName]
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
    //ur.role_name specifies the columns you want to retrieve
    //u.* selects all columns from the users table, and ur.role_name selects the role_name column from the user_roles table.
    try {
      const userQuery = await pool.query(
        "SELECT u.*, ur.role_name FROM users u JOIN user_roles ur ON u.user_id = ur.user_id WHERE u.email = $1",
        [email]
      );

      if (userQuery.rows.length === 0) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const user = userQuery.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const userId = user.user_id;
      const role = user.role_name; // Retrieve the user's role from the query result

      const accessToken = AccessToken(userId, role);
      const refreshToken = RefreshToken(userId);

      const fullName = `${user.first_name} ${user.last_name}`;

      res.json({
        fullName,
        accessToken,
        refreshToken,
        role, // Include the role in the response
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

module.exports = router;
