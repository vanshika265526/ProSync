const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Please add a project name'],
        },
        type: {
            type: String,
            default: 'Private Board',
        },
        status: {
            type: String,
            default: 'Active',
        },
        team: [
            {
                id: String,
                name: String,
                email: String,
                role: String,
                avatar: String,
            }
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Project', projectSchema);
