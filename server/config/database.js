const { Pool } = require("pg");
require("dotenv").config({ path: '../.env' });

        const pool = new Pool({
        host:process.env.DB_HOST,
        port:process.env.DB_PORT,
        user:process.env.DB_USER,
        password:process.env.DB_PSW,
        database:process.env.DB_NAME,

        });


        pool.query('SELECT NOW()', (err, res) => {
            if (err) {
                console.error(err);
            }else
            
            console.log(res.rows[0]);
        });

        module.exports = pool
























