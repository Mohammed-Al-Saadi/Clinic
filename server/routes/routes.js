const express = require("express");
const router = express.Router();
const { register } = require("../controller/register");
const { login } = require("../controller/login");



router.post("/register", register); //POST request to register the user

router.post("/login", login); // POST request to login the user

router.get("/", (req, res) => {
  res.json({ message: "Welcome to clinic application." });
});

module.exports = router;
