const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 3000;
const { authRouter } = require("./routes/authRoutes");
const { dashboardRouter } = require("./routes/dashboardRoutes");

app.use(express.json());
app.use(morgan("combined"));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/", dashboardRouter);

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
