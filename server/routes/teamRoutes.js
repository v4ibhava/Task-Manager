const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Team = require("../models/Team");
const User = require("../models/User");

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

// Get Teams (public - no auth required)
router.get(
  "/teams",
  async (req, res) => {
    const teams = await Team.find()
      .populate("leader", "username role team")
      .sort({ name: 1 });

    res.json(teams);
  }
);

// Create Team
router.post(
  "/teams",
  verifyToken,
  async (req, res) => {
    try {
      if (
        req.role !== "manager" &&
        req.role !== "admin"
      ) {
        return res.status(403).json({
          message: "No permission"
        });
      }

      const team =
        await Team.create({
          name: req.body.name,
          createdBy: req.userId
        });

      res.json(team);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

// Assign Team Leader
router.put(
  "/teams/:id/leader",
  verifyToken,
  async (req, res) => {
    try {
      if (
        req.role !== "manager" &&
        req.role !== "admin"
      ) {
        return res.status(403).json({
          message: "No permission"
        });
      }

      const { leaderId } = req.body;

      const user = await User.findById(leaderId);
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Update the user's role and team
      await User.findByIdAndUpdate(
        leaderId,
        { role: "tl", team: req.body.teamName }
      );

      // Store the leader reference on the team
      await Team.findByIdAndUpdate(
        req.params.id,
        { leader: leaderId }
      );

      res.json({
        message: "Team leader assigned"
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

// Delete Team
router.delete(
  "/teams/:id",
  verifyToken,
  async (req, res) => {
    try {
      if (req.role !== "manager" && req.role !== "admin") {
        return res.status(403).json({
          message: "No permission"
        });
      }

      await Team.findByIdAndDelete(
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