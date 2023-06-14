const pool = require("../config/database");
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
  checkUserRole,
};
