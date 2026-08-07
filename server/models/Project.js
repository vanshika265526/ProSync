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
                // Only two roles exist: 'Admin' (the creator) and 'Collaborator' (everyone else)
                role: { type: String, default: 'Collaborator' },
                avatar: String,
            }
        ],

        // --- GitHub Smart Integration ---
        // A snapshot of the connected repository. Refreshed by the polling sync
        // engine; never the source of truth (GitHub is), just a fast local cache.
        github: {
            connected: { type: Boolean, default: false },
            repositoryId: { type: Number },
            repositoryName: { type: String },   // e.g. "ProSync"
            fullName: { type: String },         // e.g. "owner/ProSync"
            owner: { type: String },
            repositoryUrl: { type: String },
            description: { type: String },
            defaultBranch: { type: String },
            avatar: { type: String },
            visibility: { type: String },       // 'public' | 'private'
            isPrivate: { type: Boolean, default: false },
            language: { type: String },

            // Counters (refreshed on sync)
            stars: { type: Number, default: 0 },
            forks: { type: Number, default: 0 },
            watchers: { type: Number, default: 0 },
            openIssues: { type: Number, default: 0 },
            openPullRequests: { type: Number, default: 0 },
            closedPullRequests: { type: Number, default: 0 },
            totalCommits: { type: Number, default: 0 },
            contributors: { type: Number, default: 0 },

            // Latest commit on the default branch
            lastCommit: {
                sha: String,
                message: String,
                author: String,
                authorAvatar: String,
                url: String,
                date: Date,
            },

            repositoryUpdatedAt: { type: Date },
            connectedAt: { type: Date },
            connectedBy: { type: String },      // email of the user who connected it
            lastSyncedAt: { type: Date },
            syncStatus: {
                type: String,
                enum: ['synced', 'pending', 'failed', 'not_connected'],
                default: 'not_connected',
            },
            syncError: { type: String },
        },

        // Chronological repo-level feed (commits, merged PRs, closed issues, releases...)
        githubActivity: [
            {
                type: { type: String },      // 'commit' | 'pull_request' | 'issue' | 'release' | 'branch' | 'repository'
                action: { type: String },    // 'merged' | 'closed' | 'opened' | 'created' | 'pushed'
                title: { type: String },
                number: { type: Number },
                actor: { type: String },
                actorAvatar: { type: String },
                url: { type: String },
                sha: { type: String },
                timestamp: { type: Date },
            }
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Project', projectSchema);
