const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    return res
      .status(401)
      .json({ message: "No authentication token provided" });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No authentication token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decodedToken.user; // Attach the user object from the decoded token to req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

module.exports = authenticateUser;
