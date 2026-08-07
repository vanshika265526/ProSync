const mongoose = require('mongoose');

/**
 * Command palette "Recent" section (Feature 1).
 *
 * One row per (user, entry). Re-selecting an existing entry bumps `lastUsedAt`
 * and `useCount` instead of inserting a duplicate — that's what the unique
 * compound index below is for.
 */
const recentSearchSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Stable identity of the thing that was picked.
        // For commands this is the command id ('nav.calendar'); for entities
        // it's the document id.
        key: { type: String, required: true },

        // What the palette shows.
        label: { type: String, required: true },
        subtitle: { type: String },

        // 'command' | 'task' | 'project' | 'note' | 'member' | 'query'
        kind: { type: String, default: 'command' },

        // Where selecting it should take the user (handled client-side).
        action: { type: String },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

        // No schema defaults on these two: the upsert in searchService writes
        // `lastUsedAt` via $set and `useCount` via $inc. If they also had
        // defaults, setDefaultsOnInsert would emit a $setOnInsert for the same
        // paths and MongoDB would reject the update with a path conflict.
        useCount: { type: Number },
        lastUsedAt: { type: Date },
    },
    { timestamps: true }
);

recentSearchSchema.index({ user: 1, key: 1 }, { unique: true });
recentSearchSchema.index({ user: 1, lastUsedAt: -1 });

module.exports = mongoose.model('RecentSearch', recentSearchSchema);
