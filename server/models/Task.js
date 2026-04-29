const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },

    description: {
        type:String,
        default:""
    },
    assignedTo: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    team: {
        type: String,
        default: "general"
    },
    status: {
        type: String,
        enum: ["pending", "ongoing", "completed"],
        default: "pending"
    }
}, { timestamps: true })

module.exports = mongoose.model("Task", taskSchema);
