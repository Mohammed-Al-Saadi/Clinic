const bcrypt = require("bcrypt");
const pool = require("../config/database");
const { RefreshToken, AccessToken } = require("../utils/jwtTokens");

// Register a new user
exports.registerUser = async (req, res) => {
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

    const createdAt = new Date().toISOString();
    const status = "active"; // Set the default status to "active"

    await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, created_at, status) VALUES ($1, $2, $3, $4, $5, $6)",
      [first_name, last_name, email, hashedPassword, createdAt, status]
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
};

// Login user
exports.loginUser = async (req, res) => {
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
    const status = user.status;
    const accessToken = AccessToken(userId, role, status);
    const refreshToken = RefreshToken(userId);

    const fullName = `${user.first_name} ${user.last_name}`;

    // Update the last_login field for the user
    const lastLogin = new Date().toISOString();
    await pool.query("UPDATE users SET last_login = $1 WHERE user_id = $2", [
      lastLogin,
      userId,
    ]);

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
};

// Get user by ID
exports.getUserById = async (req, res) => {
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
};

// Update user profile information
exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE user_id = $4",
      [first_name, last_name, email, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (result.rowCount === 1) {
      res.json({ message: "User profile updated successfully" });
    } else {
      res.status(500).json({ error: "Failed to update user profile" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change user password
exports.changeUserPassword = async (req, res) => {
  const { id } = req.params;
  const { current_password, new_password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      current_password,
      user.rows[0].password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid current password" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const updateResult = await pool.query(
      "UPDATE users SET password = $1 WHERE user_id = $2",
      [hashedPassword, id]
    );

    if (updateResult.rowCount === 1) {
      res.json({ message: "Password changed successfully" });
    } else {
      res.status(500).json({ error: "Failed to change password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete user account
