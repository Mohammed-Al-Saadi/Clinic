require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  // Extract the token from the request headers
  const authorizationHeader = req.headers["authorization"];

  // Check if the token is present
  if (!authorizationHeader) {
    return res
      .status(401)
      .json({ message: "No authentication token provided" });
  }

  // Split the authorization header to remove the Bearer prefix
  const token = authorizationHeader.split(" ")[1];

  // Check if the token is present after removing the prefix
  if (!token) {
    return res
      .status(401)
      .json({ message: "No authentication token provided" });
  }

  try {
    // Verify and decode the token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    // Attach the payload and headers to the request object
    req.payload = decodedToken;
    req.headers = authorizationHeader;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

module.exports = authenticateUser;
