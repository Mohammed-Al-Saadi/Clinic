require("dotenv").config({ path: './.env' });
const express = require("express");
const app = express();
const cors = require('cors');
const user = require("../server/routes/routes");



app.use(express.json());
app.use(cors());
app.use('/user', user)

// Start the server
const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
