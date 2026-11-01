const mongoose = require("mongoose");

const Task = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        default: "",
        minlength: 16,
        maxlength: 1000,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    dueDate: {
        type: Date,
        required: true
    }
}, { timestamps: true })

Task.index({ owner_id: 1, createdAt: -1 });
Task.index({ owner_id: 1, dueDate: 1 });

module.exports = mongoose.model('Task', Task)