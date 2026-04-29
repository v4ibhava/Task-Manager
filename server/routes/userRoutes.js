const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      "secretkey"
    );

    req.userId = decoded.id;
    req.role = decoded.role;

    next();
  } catch {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find(
      {},
      "username role team"
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;