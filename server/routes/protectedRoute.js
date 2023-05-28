const express = require("express");
const authenticateUser = require("../utils/authMiddleware");
const protectedrouter = express.Router();

// Protected route
protectedrouter.get("/", authenticateUser, (req, res) => {
  // Access the payload and headers information from req.payload and req.headers
  const { id, username } = req.payload;
  const authorizationHeader = req.headers;

  // Your logic for the protected route
  res.json({
    id,
    username,
    headers: authorizationHeader,
    message: "Access granted to protected route",
  });
});

module.exports = protectedrouter;
