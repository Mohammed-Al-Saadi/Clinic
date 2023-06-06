const pool = require("../config/database");

const assignAdminRole = async (req, res, next) => {
  const userId = req.params.userId;
  const validateUUID = (uuid) => {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4|8|bB][0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
  };

  try {
    // Check if the userId is a valid UUID
    const isValidUUID = validateUUID(userId);
    if (!isValidUUID) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if the user already has an admin role
    const userRole = await pool.query(
      "SELECT * FROM user_roles WHERE user_id = $1 AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin')",
      [userId]
    );

    if (userRole.rows.length > 0) {
      return res.status(400).json({ error: "User already has an admin role" });
    }

    // Get the role_id for the 'admin' role
    const adminRole = await pool.query(
      "SELECT role_id FROM roles WHERE role_name = 'admin'"
    );

    const roleId = adminRole.rows[0].role_id;

    // Assign the admin role to the user
    await pool.query(
      "INSERT INTO user_roles (user_id, role_id, role_name) VALUES ($1, $2, 'admin')",
      [userId, roleId]
    );

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const checkAdminRole = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if the user has the 'admin' role
    const adminRole = await pool.query(
      "SELECT role_id FROM roles WHERE role_name = $1",
      ["admin"]
    );

    const userAdminRole = await pool.query(
      "SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2",
      [userId, adminRole.rows[0].role_id]
    );

    if (userAdminRole.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Access denied. Only admins are allowed." });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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

module.exports = {
  assignAdminRole,
  checkAdminRole,
  checkUserRole,
};
