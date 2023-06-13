require("dotenv").config({ path: "./.env" });
const express = require("express");
const app = express();
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const protectedrouter = require("./routes/protectedRoute");
const adminRouter = require("./routes/AdminRoutes");
const forgetPassword = require("./routes/forgotPassword");

app.use(express.json());
app.use(cors());
app.use("/users", userRouter);
app.use("/", adminRouter);
app.use("/protected", protectedrouter);
app.use("/reset-password", forgetPassword);

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
