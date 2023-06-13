const pool = require("../config/database");
const updateToAdmin = async (req, res, next) => {
  const { id } = req.params;
  console.log("User ID:", id); // Log the ID parameter for debugging

  try {
    // Check if the user already has the admin role
    const userRoleQuery = await pool.query(
      `SELECT * FROM user_roles 
       WHERE user_id = $1 AND role_name = 'admin'`,
      [id]
    );

    console.log("User Role Query:", userRoleQuery.rows); // Log the userRoleQuery result for debugging

    if (userRoleQuery.rows.length === 0) {
      // User doesn't have the admin role assigned, so update the role
      const updateUserRoleQuery = await pool.query(
        `UPDATE user_roles 
         SET role_id = (SELECT role_id FROM roles WHERE role_name = 'admin'), 
             role_name = 'admin'
         WHERE user_id = $1`,
        [id]
      );

      console.log("Update User Role Query:", updateUserRoleQuery); // Log the updateUserRoleQuery result for debugging

      // Return a success message for role update
      return res.json({ message: "User role updated successfully" });
    } else {
      // User already has the admin role assigned
      return res.json({ message: "User already has the admin role assigned" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const checkUserRole = (role) => {
  return async (req, res, next) => {
    console.log("checkUserRole middleware");

    try {
      // Get the role from the authenticated user
      const authenticatedUser = req.user;
      const userRole = authenticatedUser.role;

      if (userRole !== role) {
        // User doesn't have the required role, so return an error
        return res.status(403).json({ error: "Unauthorized" });
      }

      // User has the required role, proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};

module.exports = {
  updateToAdmin,
  checkUserRole,
};
