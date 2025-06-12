const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");
const usersRoutes = require("./routes/usersRoutes");

const questionnaireRoutes = require("./routes/questionnaireRoutes");
const responseRoutes = require("./routes/responseRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGINS || "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api", authRoutes);
app.use("/api", videoRoutes);
app.use("/api", usersRoutes);

app.use("/api/questionnaires", questionnaireRoutes);
app.use("/responses", responseRoutes);
app.use("/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
