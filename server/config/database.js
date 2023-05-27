const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection pool
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error executing query", err);
  } else {
    console.log("Connected to the database");
  }
});
module.exports = pool;
