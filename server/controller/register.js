const bcrypt = require("bcrypt");
const pool = require("../config/database");
require("dotenv").config({ path: '../.env' });


//Registration Function

exports.register = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
  
    try {
        const user = await pool.query(`SELECT * FROM users WHERE email= $1;`, [email]); //Checking if user already exists
        if (user.rows.length != 0 ) {
            return res.status(400).json({
                error: "Email already there, No need to register again.",
            });
        }
        else {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err)
                    res.status(err).json({
                        error: "Please check your password!!",
                    });
                const user = {
                    first_name,
                    last_name,
                    email,
                    password: hash,
                };

                //Inserting data into the database

                pool.query(`INSERT INTO users (first_name, last_name, email, password) VALUES ($1,$2,$3,$4);`, [user.first_name, user.last_name, user.email, user.password], (err) => {

                    try {
                        res.status(200).send({ message: 'User added to database'});
                    } catch (error) {
                        console.error(error.message)
                        res.status(500).send(" server error")   
                    }
                })
           
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Please check your connection!", //Database connection error
        });
    };
}

