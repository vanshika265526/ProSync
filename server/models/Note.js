const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        content: {
            type: String,
            required: [true, 'Please add content'],
        },
        // Optional association, added so note edits can appear on a project's
        // history timeline. Notes remain user-scoped and work without it.
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            index: true,
        },
        date: {
            type: String,
            default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Note', noteSchema);
