const pool = require("../config/database");

const checkUserRole = (role) => {
  return async (req, res, next) => {
    try {
      // Get the role and status from the authenticated user
      const authenticatedUser = req.user;
      const userRole = authenticatedUser.role;
      const userStatus = authenticatedUser.status;

      if (userStatus !== "active") {
        // User is not active, so return an error
        return res.status(401).json({ error: "User is not active" });
      }

      if (userRole !== role) {
        // User doesn't have the required role, so return an error
        return res.status(403).json({ error: "Unauthorized" });
      }

      // User has the required role and is active, proceed to the next middleware or route handler
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
