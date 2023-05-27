const { validationResult } = require("express-validator");

// Middleware function to validate inputs
const validateInput = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  // Proceed to the next middleware or route handler
  next();
};

module.exports = validateInput;
