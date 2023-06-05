const pool = require("../config/database");

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

module.exports = checkAdminRole;
