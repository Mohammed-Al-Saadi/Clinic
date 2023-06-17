const jwt = require("jsonwebtoken");

module.exports = {
  AccessToken: (user_id, role, status) => {
    const payload = {
      user: { id: user_id, role, status }, // Include the role and status in the payload
    };
    return jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });
  },
  RefreshToken: (user_id) => {
    const payload = {
      user: { id: user_id },
    };
    return jwt.sign(payload, process.env.SECRET_KEY);
  },
};
