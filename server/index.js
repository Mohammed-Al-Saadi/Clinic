const express = require("express");
const app = express();

// Define a route
//this is just an example-> we will be using routes in their own file.
app.get("/", (req, res) => {
  res.send("Hello clinic app!");
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
