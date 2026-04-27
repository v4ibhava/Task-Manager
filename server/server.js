const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  "https://task-manager-chi-mauve.vercel.app",
  "https://task-manager-lilexcjfv-fantasize-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // allow for now
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API Running");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api", taskRoutes);

// mongodb
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// error middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});