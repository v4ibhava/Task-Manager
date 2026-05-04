const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");
const User = require("../models/User");
const { sendTaskAssignmentEmail } = require("../utils/emailService");

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

      // Send Email Notification (Async/Non-blocking)
      sendTaskAssignmentEmail(
        assignee.email,
        assignee.username,
        task.title,
        task.description,
        assigner.username
      );

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

      const { page = 1, limit = 10, search, status, sortBy = "createdAt", order = "desc" } = req.query;

      const query = {};

      if (user.role === "employee") {
        query.assignedTo = req.userId;
      } else if (user.role === "tl") {
        query.team = user.team;
      }

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      if (status && status !== "all") {
        query.status = status;
      }

      const sortObject = {};
      sortObject[sortBy] = order === "asc" ? 1 : -1;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const totalTasks = await Task.countDocuments(query);
      const totalPages = Math.ceil(totalTasks / limitNumber);

      const tasks = await Task.find(query)
        .populate("assignedTo", "username role team")
        .populate("assignedBy", "username role team")
        .sort(sortObject)
        .skip(skip)
        .limit(limitNumber);

      // Calculate stats
      const statsQuery = { ...query };
      delete statsQuery.status; // Remove status filter for overall stats
      const allMatchingTasks = await Task.find(statsQuery).select("status");

      const stats = {
        pending: 0,
        ongoing: 0,
        completed: 0
      };

      allMatchingTasks.forEach(t => {
        if (stats[t.status] !== undefined) {
          stats[t.status]++;
        }
      });

      res.json({
        tasks,
        totalPages,
        currentPage: pageNumber,
        totalTasks,
        stats
      });
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
        { status, statusUpdatedAt: Date.now() },
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