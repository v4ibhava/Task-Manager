const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require("./routes/taskRoutes")
const authRoutes = require("./routes/authRoutes")
require('dotenv').config();

const app = express()

// CORS configuration
const allowedOrigins = [
  'https://task-manager-chi-mauve.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.use("/api", taskRoutes)
app.use("/api/auth", authRoutes);

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
    res.send("✅ API Running");
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`🚀 Server running on port ${PORT}`);
})