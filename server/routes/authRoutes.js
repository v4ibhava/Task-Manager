const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const exist = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (exist) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hash,
  });

  res.json({
    message: "Registered successfully",
  });
});

// Login
router.post("/login", async (req, res) => {
  const { login, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: login }, { username: login }],
  });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  const match = await bcrypt.compare(
    password,
    user.password
  );

  if (!match) {
    return res.status(400).json({
      message: "Wrong password",
    });
  }

  const token = jwt.sign(
    { id: user._id },
    "secretkey",
    { expiresIn: "7d" }
  );

  res.json({
    token,
    username: user.username,
  });
});

module.exports = router;