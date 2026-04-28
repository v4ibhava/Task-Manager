const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Task = require("../models/Task")

// Middleware to verify token and extract userId
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    
    try {
        const decoded = jwt.verify(token, "secretkey");
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Add Task
router.post("/tasks", verifyToken, async(req, res) => {
    try {
        const task = await Task.create({ 
            title: req.body.title,
            userId: req.userId
        });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// get all tasks for logged-in user
router.get("/tasks", verifyToken, async(req, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1});
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//delete task
router.delete("/tasks/:id", verifyToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        if (task.userId.toString() !== req.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// update status
router.put("/tasks/:id", verifyToken, async(req,res)=>{
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        if (task.userId.toString() !== req.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        const updatedTask = await Task.findByIdAndUpdate(req.params.id,
            { status : req.body.status },
            { new: true }
        );
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;