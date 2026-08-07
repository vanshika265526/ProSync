const mongoose = require('mongoose');

/**
 * Unified Notification Center (Feature 2).
 *
 * Originally GitHub-only; now the single inbox for task, project, member,
 * note and GitHub events. One document per recipient so read-state is
 * per-user. Every field the GitHub integration already wrote is still here —
 * the new columns (`category`, `priority`, actor snapshot, `entity*`) are all
 * optional with sane defaults, so existing documents keep rendering.
 */
const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            index: true,
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },

        // 'github' | 'system' | 'task' | 'project' | 'member' | 'note'
        source: { type: String, default: 'system' },

        // Filter bucket surfaced as tabs in the drawer.
        // NOTE: legacy GitHub rows have no category — the read path back-fills
        // it from `source` so old notifications still land under a tab.
        category: {
            type: String,
            enum: ['task', 'project', 'member', 'note', 'github', 'system'],
            default: 'system',
            index: true,
        },

        // 'task_assigned' | 'task_completed' | 'task_due_soon' | 'task_overdue'
        // | 'project_created' | 'member_joined' | 'note_updated'
        // | 'pr_merged' | 'issue_closed' | 'repo_connected' | ...
        type: { type: String, required: true },

        title: { type: String, required: true },
        message: { type: String },
        // Optional third line, e.g. "Automatically Completed"
        detail: { type: String },

        // --- Actor snapshot: who caused this, denormalised for rendering ---
        actorName: { type: String },
        actorEmail: { type: String },
        actorAvatar: { type: String },

        // What the notification points at, so clicking it can deep-link.
        entityType: {
            type: String,
            enum: ['task', 'project', 'note', 'member', 'repository',
                'pull_request', 'issue', 'comment', ''],
            default: '',
        },
        entityId: { type: String },

        url: { type: String },
        severity: {
            type: String,
            enum: ['info', 'success', 'warning', 'error'],
            default: 'info',
        },
        priority: {
            type: String,
            enum: ['low', 'normal', 'high', 'urgent'],
            default: 'normal',
            index: true,
        },

        read: { type: Boolean, default: false },
        readAt: { type: Date },

        // Prevents the polling engine (and the due-date sweeper) from emitting
        // the same notification twice.
        dedupeKey: { type: String, index: true },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, category: 1, createdAt: -1 });
// A compound *sparse* index would still index docs that only have `user`,
// making every dedupeKey-less notification collide on `dedupeKey: null`.
// A partial index restricted to real string keys is what we actually want.
notificationSchema.index(
    { user: 1, dedupeKey: 1 },
    { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } }
);

module.exports = mongoose.model('Notification', notificationSchema);
