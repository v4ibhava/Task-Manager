const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");
const User = require("../models/User");

// Verify Token
const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token"
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
      message: "Invalid token"
    });
  }
};

// Assign Task
router.post(
  "/tasks",
  verifyToken,
  async (req, res) => {
    try {
      const {
        title,
        description,
        assignedTo
      } = req.body;

      const user = await User.findById(
        req.userId
      );

      const task = await Task.create({
        title,
        description,
        assignedTo,
        assignedBy: req.userId,
        team: user.team
      });

      res.json(task);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

// Get Tasks By Role
router.get(
  "/tasks",
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.userId
      );

      let tasks = [];

      if (user.role === "employee") {
        tasks = await Task.find({
          assignedTo: req.userId
        })
          .populate("assignedTo assignedBy")
          .sort({ createdAt: -1 });
      } else if (user.role === "tl") {
        tasks = await Task.find({
          team: user.team
        })
          .populate("assignedTo assignedBy")
          .sort({ createdAt: -1 });
      } else {
        tasks = await Task.find()
          .populate("assignedTo assignedBy")
          .sort({ createdAt: -1 });
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

// Update Status
router.put(
  "/tasks/:id",
  verifyToken,
  async (req, res) => {
    try {
      const task =
        await Task.findByIdAndUpdate(
          req.params.id,
          {
            status: req.body.status
          },
          {
            returnDocument: "after"
          }
        );

      res.json(task);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

// Delete
router.delete(
  "/tasks/:id",
  verifyToken,
  async (req, res) => {
    try {
      await Task.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message: "Deleted"
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

module.exports = router;