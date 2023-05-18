const bcrypt = require("bcrypt");
const pool = require("../config/database");
const { RefreashToken, AccessToken } = require("../utils/jwtTokens");
require("dotenv").config({ path: '../.env' });



//Login Function
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query(`SELECT * FROM users WHERE email= $1;`, [email]) //Verifying if the user exists in the database
        if (user.rows.length === 0) {
            res.status(400).json({
                error: "User is not registered, Sign Up first",
            });
        }
        else {
            bcrypt.compare(password, user.rows[0].password, (err, result) => { //Comparing the hashed password
                if (err) {
                    res.status(500).json({
                        error: "Server error",
                    });
                } else if (result === true) { //Checking if credentials match
                    const Access_Token = AccessToken(user.rows[0].user_id) 
                    const Refresh_Token = RefreashToken(user.rows[0].user_id) 
                    const firstName = user.rows[0].first_name
                    const lastName = user.rows[0].last_name
                    const fullName= firstName.concat(' ',lastName)
                    try {
                        res.json({fullName ,Access_Token, Refresh_Token})

                    } catch (error) {

                        console.error(error.message)
                        res.status(500).send("Server error")
                        
                    }
                    
                
                }
                else {
                    //Declaring the errors
                    if (result != true)
                        res.status(400).json({
                            error: "Password or email is incorrect!",
                        });
                }
            })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Server error!", //Database connection 
        });
    };
};