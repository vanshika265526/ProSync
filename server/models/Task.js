<<<<<<< HEAD
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

        // --- GitHub Smart Integration ---
        github: {
            // Linked pull request (at most one per task)
            pullRequest: {
                number: Number,
                title: String,
                url: String,
                author: String,
                authorAvatar: String,
                state: String,              // 'open' | 'closed'
                draft: { type: Boolean, default: false },
                merged: { type: Boolean, default: false },
                mergedAt: Date,
                mergedBy: String,
                branch: String,
                baseBranch: String,
                additions: Number,
                deletions: Number,
                changedFiles: Number,
                commits: Number,
                createdAt: Date,
                updatedAt: Date,
                closedAt: Date,
            },

            // Linked issue (at most one per task)
            issue: {
                number: Number,
                title: String,
                url: String,
                creator: String,
                creatorAvatar: String,
                state: String,              // 'open' | 'closed'
                stateReason: String,
                labels: [{ name: String, color: String }],
                assignee: String,
                assigneeAvatar: String,
                comments: Number,
                createdAt: Date,
                updatedAt: Date,
                closedAt: Date,
            },

            // Commits from the linked PR's branch
            commitHistory: [
                {
                    sha: String,
                    message: String,
                    author: String,
                    authorAvatar: String,
                    url: String,
                    date: Date,
                }
            ],

            // Per-task event feed shown in the Task Activity panel.
            // NOTE: `type` must be wrapped as `{ type: String }` — a bare
            // `type: String` here would make Mongoose read the whole object as a
            // SchemaType declaration and store this as an array of strings.
            activity: [
                {
                    // 'pr_created' | 'pr_merged' | 'pr_reopened' | 'issue_closed' | 'commit_added' | ...
                    type: { type: String },
                    message: String,
                    actor: String,
                    url: String,
                    timestamp: Date,
                }
            ],

            lastSync: { type: Date },
            syncStatus: {
                type: String,
                enum: ['synced', 'pending', 'failed', 'not_connected'],
                default: 'not_connected',
            },
            syncError: { type: String },

            // Auto-completion bookkeeping (Feature 5)
            autoCompleted: { type: Boolean, default: false },
            autoCompletedAt: { type: Date },
            autoCompletedReason: { type: String },
            // Status the task held before we auto-completed it, so a reopened PR
            // can restore something sensible instead of guessing.
            statusBeforeAutoComplete: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Task', taskSchema);
=======
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
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
