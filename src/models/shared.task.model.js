const mongoose = require("mongoose");

const SharedTask = new mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    collaborator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

// Enforce unique collaborators per task:
SharedTask.index({ task_id: 1, collaborator: 1 }, { unique: true });
SharedTask.index({ collaborator: 1 });


module.exports = mongoose.model('SharedTask', SharedTask)