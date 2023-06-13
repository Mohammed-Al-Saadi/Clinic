const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/database");
const { RefreshToken, AccessToken } = require("../utils/jwtTokens");
const {
  registerValidationRules,
  loginValidationRules,
  validateInput,
} = require("../utils/validator");

const router = express.Router();

router.post(
  "/register",
  registerValidationRules(),
  validateInput,
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

router.post(
  "/login",
  loginValidationRules(),
  validateInput,
  async (req, res) => {
    const { email, password } = req.body;

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
      const role = user.role_name;

      const accessToken = AccessToken(userId, role);
      const refreshToken = RefreshToken(userId);

      const fullName = `${user.first_name} ${user.last_name}`;

      res.json({
        fullName,
        accessToken,
        refreshToken,
        role,
        message: "Login successful",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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
