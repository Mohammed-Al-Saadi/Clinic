const adminRouter = require("express").Router();
const pool = require("../config/database");
const authenticateUser = require("../middlewares/authMiddleware");
const { checkUserRole, updateToAdmin } = require("../middlewares/roles");

// Get all users (accessible only to admins)
adminRouter.get(
  "/users/:id",
  authenticateUser,
  checkUserRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Retrieve the user with the specified userId
      const user = await pool.query("SELECT * FROM users");

      if (!user.rows.length) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return the user data
      res.json(user.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update user to become an admin (accessible only to admins)
adminRouter.put(
  "/assign-admin/:id",
  authenticateUser,
  checkUserRole("admin"),
  updateToAdmin,
  async (req, res) => {
    console.log("Inside update route handler");

    try {
      const { id } = req.params;

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
  }
);

module.exports = adminRouter;
