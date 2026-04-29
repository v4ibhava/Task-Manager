const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username,
      email,
      password,
      role,
      team } = req.body;

    const exist = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (exist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const userTeam = role === "manager" || role === "admin" ? null : (team || "general");

    await User.create({
      username,
      email,
      password: hash,
      role: role || "employee",
      team: userTeam
    });

    res.json({
      message: "Registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "register failed"
    })
  }
})
// Login
router.post("/login", async (req, res) => {
  try {
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
      { id: user._id,
        role: user.role
       },
      "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      username: user.username,
      email: user.email,
      role:user.role,
      team: user.team
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;