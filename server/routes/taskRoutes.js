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

// Assign Task (managers, admins, TLs only)
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

      // --- Validation ---
      if (!title || !title.trim()) {
        return res.status(400).json({
          message: "Task title is required"
        });
      }

      if (!assignedTo) {
        return res.status(400).json({
          message: "Assigned employee is required"
        });
      }

      // Verify the assigner has permission (not an employee)
      const assigner = await User.findById(req.userId);
      if (!assigner) {
        return res.status(404).json({ message: "User not found" });
      }

      if (assigner.role === "employee") {
        return res.status(403).json({
          message: "Employees cannot assign tasks"
        });
      }

      // Verify the assigned user exists
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return res.status(404).json({
          message: "Assigned employee not found"
        });
      }

      const task = await Task.create({
        title: title.trim(),
        description: description ? description.trim() : "",
        assignedTo,
        assignedBy: req.userId,
        team: assigner.team
      });

      // Populate the refs before returning
      const populated = await Task.findById(task._id)
        .populate("assignedTo", "username role team")
        .populate("assignedBy", "username role team");

      res.json(populated);
    } catch (error) {
      res.status(500).json({
        message: "Failed to create task",
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

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let tasks = [];

      if (user.role === "employee") {
        // Employees see only tasks assigned to them
        tasks = await Task.find({
          assignedTo: req.userId
        })
          .populate("assignedTo", "username role team")
          .populate("assignedBy", "username role team")
          .sort({ createdAt: -1 });
      } else if (user.role === "tl") {
        // TLs see tasks within their team
        tasks = await Task.find({
          team: user.team
        })
          .populate("assignedTo", "username role team")
          .populate("assignedBy", "username role team")
          .sort({ createdAt: -1 });
      } else {
        // Admins and Managers see all tasks
        tasks = await Task.find()
          .populate("assignedTo", "username role team")
          .populate("assignedBy", "username role team")
          .sort({ createdAt: -1 });
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch tasks",
        error: error.message
      });
    }
  }
);

// Update Status (only assigned user, or manager/admin/tl)
router.put(
  "/tasks/:id",
  verifyToken,
  async (req, res) => {
    try {
      const { status } = req.body;

      // Validate status value
      const validStatuses = ["pending", "ongoing", "completed"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Permission check: only the assigned user or manager/admin/tl can update
      const isAssignedUser = task.assignedTo.toString() === req.userId;
      const isPrivileged = ["manager", "admin", "tl"].includes(user.role);

      if (!isAssignedUser && !isPrivileged) {
        return res.status(403).json({
          message: "Only the assigned user or a manager can update task status"
        });
      }

      const updated = await Task.findByIdAndUpdate(
        req.params.id,
        { status },
        { returnDocument: "after" }
      )
        .populate("assignedTo", "username role team")
        .populate("assignedBy", "username role team");

      res.json(updated);
    } catch (error) {
      res.status(500).json({
        message: "Failed to update task",
        error: error.message
      });
    }
  }
);

// Delete (only manager/admin/tl)
router.delete(
  "/tasks/:id",
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only non-employees can delete tasks
      if (user.role === "employee") {
        return res.status(403).json({
          message: "Employees cannot delete tasks"
        });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      await Task.findByIdAndDelete(req.params.id);

      res.json({
        message: "Task deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete task",
        error: error.message
      });
    }
  }
);

module.exports = router;