const pool = require("../config/database");

const checkUserRole = async (req, res, next) => {
  const userId = req.params.userId;
  const desiredRoleName = "admin"; // Replace with the desired role name (e.g., 'admin', 'user')

  try {
    // Retrieve the role ID based on the desired role name
    const roleQuery = await pool.query(
      "SELECT role_id FROM roles WHERE role_name = $1",
      [desiredRoleName]
    );

    // Check if the role exists
    if (roleQuery.rows.length === 0) {
      return res.status(500).json({ error: "Desired role not found" });
    }

    const roleId = roleQuery.rows[0].role_id;

    // Check if the user has the desired role in the user_roles table
    const userRoleQuery = await pool.query(
      "SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2",
      [userId, roleId]
    );

    if (userRoleQuery.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = checkUserRole;
