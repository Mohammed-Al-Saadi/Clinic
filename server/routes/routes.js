const express = require('express');
const router = express.Router();
const { register } = require("../controller/register");
const { login } = require("../controller/login");
const { validateRegister } = require('../middelware/userValidation');
const { verifyAccessToken } = require('../middelware/verifyAccessToken');
const { rolevalidation } = require('../middelware/roleValidation');


router.post('/register',validateRegister, register  ); //POST request to register the user

router.post('/login', login, rolevalidation); // POST request to login the user

router.get("/", verifyAccessToken, (req, res) => {
    res.json({ message: "Welcome to clinic application." });
    
  });

module.exports = router;