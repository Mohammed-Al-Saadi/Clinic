require("dotenv").config({ path: "./.env" });
const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");

app.use(express.json());
app.use(cors());
app.use("/auth", authRoutes);
app.use("/admin", AdminRoutes);
app.use("/forgot-password", forgotPasswordRoutes);

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
