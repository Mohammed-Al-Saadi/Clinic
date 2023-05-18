require("dotenv").config({ path: './.env' });
const express = require("express");
const app = express();
const cors = require('cors');



app.use(express.json());
app.use(cors());

// Start the server
const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
