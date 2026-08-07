const mongoose = require('mongoose');

/**
 * Live Activity Feed (Feature 4).
 *
 * One document per *thing that happened* inside a project. Unlike Notification
 * (fanned out per-recipient) an Activity is written once and read by everyone
 * on the project, so the feed stays cheap even on busy boards.
 *
 * Kept deliberately denormalised: the actor's name/avatar are snapshotted at
 * write time so rendering the feed never needs a populate() round-trip.
 */
const activitySchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // --- Actor snapshot (denormalised on purpose) ---
        actorName: { type: String, default: 'Someone' },
        actorEmail: { type: String },
        actorAvatar: { type: String },

        // Machine-readable verb, e.g. 'task_created' | 'pr_merged' | 'user_login'
        action: { type: String, required: true, index: true },

        // Human sentence rendered in the feed, e.g. "Created Authentication Task"
        description: { type: String, required: true },

        // Drives the icon + colour + the feed's filter chips.
        category: {
            type: String,
            enum: ['task', 'project', 'member', 'note', 'github', 'sprint', 'system', 'comment'],
            default: 'system',
            index: true,
        },

        // Anything the card wants to show but doesn't deserve a column:
        // { taskId, taskTitle, from, to, prNumber, url, ... }
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

// The feed is *always* "newest first, scoped to a project".
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ project: 1, category: 1, createdAt: -1 });

// Feeds are ephemeral by nature — expire entries after 90 days so the
// collection can't grow without bound on a long-lived board.
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('Activity', activitySchema);
