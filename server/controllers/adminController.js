const pool = require("../config/database");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user to become an admin
exports.updateToAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user is already an admin
    const existingRole = await pool.query(
      "SELECT role_name FROM user_roles WHERE user_id = $1",
      [id]
    );

    if (
      existingRole.rows.length !== 0 &&
      existingRole.rows[0].role_name === "admin"
    ) {
      return res.status(400).json({ error: "User is already an admin" });
    }

    // Check if the user is active
    const userStatus = await pool.query(
      "SELECT status FROM users WHERE user_id = $1",
      [id]
    );

    if (
      userStatus.rows.length === 0 ||
      userStatus.rows[0].status !== "active"
    ) {
      return res.status(401).json({ error: "User is not active" });
    }

    // Perform the update operation
    const result = await pool.query(
      "UPDATE user_roles SET role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'), role_name = 'admin' WHERE user_id = $1",
      [id]
    );

    // Check if the update was successful
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return a success message
    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
