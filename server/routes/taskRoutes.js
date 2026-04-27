const express = require("express");
const router = express.Router();
const Task = require("../models/Task")

// Add Task
router.post("/tasks", async(req, res) => {
    const task = await Task.create({ title: req.body.title });
    res.json(task);
})

// get all tasks
router.get("/tasks", async(req, res) => {
    const tasks = await Task.find().sort({ createdAt: -1});
    res.json(tasks);
})

//delete task
router.delete("/tasks/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted"});
})

// update status
router.put("/tasks/:id", async(req,res)=>{
    try {
        const task = await Task.findByIdAndUpdate(req.params.id,
            { status : req.body.status },
            { new: true }
        );
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;