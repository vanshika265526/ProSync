const mongoose = require('mongoose');

/**
 * Project History Timeline (Feature 3).
 *
 * The permanent audit log. Where Activity is a transient "what's happening
 * right now" feed, History is the durable record: it keeps old/new values so
 * the timeline can render "Priority changed from Medium to High" and is never
 * auto-expired.
 */
const historySchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        actorName: { type: String, default: 'Someone' },
        actorEmail: { type: String },
        actorAvatar: { type: String },

        // 'project_created' | 'task_completed' | 'priority_changed' | ...
        // See HISTORY_ACTIONS in services/eventService.js for the catalogue.
        action: { type: String, required: true, index: true },

        // Rendered headline, e.g. "Authentication Task Completed"
        description: { type: String, required: true },

        // What kind of thing this happened to.
        entityType: {
            type: String,
            enum: ['project', 'task', 'subtask', 'member', 'note', 'repository',
                'pull_request', 'issue', 'comment', 'attachment', 'label', 'sprint'],
            default: 'project',
            index: true,
        },
        // Loose type: subtasks/labels use string keys, not ObjectIds.
        entityId: { type: String },
        entityTitle: { type: String },

        // Filter bucket used by the timeline's chips.
        category: {
            type: String,
            enum: ['task', 'project', 'member', 'note', 'github', 'sprint', 'system', 'comment'],
            default: 'project',
            index: true,
        },

        // Field-level diff. Mixed because a value may be a string, date,
        // number, or a small object depending on the field that changed.
        field: { type: String },
        oldValue: { type: mongoose.Schema.Types.Mixed },
        newValue: { type: mongoose.Schema.Types.Mixed },

        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

historySchema.index({ project: 1, createdAt: -1 });
historySchema.index({ project: 1, category: 1, createdAt: -1 });
// Backs the timeline's free-text search box.
historySchema.index({ description: 'text', entityTitle: 'text', actorName: 'text' });

module.exports = mongoose.model('History', historySchema);
