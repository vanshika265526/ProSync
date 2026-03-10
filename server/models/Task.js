const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Project',
        },
        title: {
            type: String,
            required: [true, 'Please add a task title'],
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            default: 'Todo',
        },
        priority: {
            type: String,
            default: 'Medium',
        },
        deadline: {
            type: Date,
        },
        members: [String],
        tags: [
            {
                label: String,
                color: String,
            }
        ],
        subtasks: [
            {
                title: String,
                completed: {
                    type: Boolean,
                    default: false,
                },
            }
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Task', taskSchema);
