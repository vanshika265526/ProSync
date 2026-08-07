const Task = require('../models/Task');
const Project = require('../models/Project');
const Note = require('../models/Note');
const User = require('../models/User');
const RecentSearch = require('../models/RecentSearch');

/**
 * Backing store for the command palette (Feature 1).
 *
 * Fuzzy matching itself lives on the client — the palette has to feel
 * instantaneous and the static command list never leaves the browser. This
 * service exists for the parts the client *can't* know: entities the user
 * hasn't loaded (tasks on other projects, members, notes) and the persisted
 * "Recent" list.
 */

const MAX_RECENTS = 12;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const defaultAvatar = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=7D00FF&color=fff`;

/** Every project the user can see. Scopes all other lookups. */
const visibleProjects = (user) =>
    Project.find({ $or: [{ user: user._id }, { 'team.email': user.email }] })
        .select('_id name type status team github.fullName')
        .lean();

/**
 * Global search across projects, tasks, notes and teammates.
 * Returns a flat, already-typed result list the palette can render directly.
 */
const globalSearch = async (user, rawQuery, { limit = 8 } = {}) => {
    const q = (rawQuery || '').trim();
    const projects = await visibleProjects(user);
    const projectIds = projects.map((p) => p._id);
    const projectNameById = new Map(projects.map((p) => [String(p._id), p.name]));

    // Empty query => a small "what's around me" set rather than nothing.
    const rx = q ? new RegExp(escapeRegex(q), 'i') : null;

    const [tasks, notes] = await Promise.all([
        Task.find({
            projectId: { $in: projectIds },
            ...(rx ? { $or: [{ title: rx }, { description: rx }] } : {}),
        })
            .select('title status priority projectId deadline')
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean(),

        Note.find({
            user: user._id,
            ...(rx ? { $or: [{ title: rx }, { content: rx }] } : {}),
        })
            .select('title content updatedAt')
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean(),
    ]);

    const matchedProjects = (rx ? projects.filter((p) => rx.test(p.name)) : projects).slice(0, limit);

    // Members come from the team arrays already in memory — no extra query
    // unless we need avatars the arrays don't carry.
    const seenEmails = new Set();
    const members = [];
    for (const project of projects) {
        for (const m of project.team || []) {
            if (!m.email || seenEmails.has(m.email)) continue;
            if (rx && !rx.test(m.name || '') && !rx.test(m.email)) continue;
            seenEmails.add(m.email);
            members.push({
                id: m.id || m.email,
                type: 'member',
                label: m.name || m.email.split('@')[0],
                subtitle: m.email,
                avatar: m.avatar || defaultAvatar(m.name),
                projectId: String(project._id),
                role: m.role,
            });
            if (members.length >= limit) break;
        }
        if (members.length >= limit) break;
    }

    return {
        projects: matchedProjects.map((p) => ({
            id: String(p._id),
            type: 'project',
            label: p.name,
            subtitle: p.type || 'Private Board',
            projectId: String(p._id),
            meta: { status: p.status, repo: p.github?.fullName || null },
        })),
        tasks: tasks.map((t) => ({
            id: String(t._id),
            type: 'task',
            label: t.title,
            subtitle: projectNameById.get(String(t.projectId)) || 'Task',
            projectId: String(t.projectId),
            meta: { status: t.status, priority: t.priority, deadline: t.deadline },
        })),
        notes: notes.map((n) => ({
            id: String(n._id),
            type: 'note',
            label: n.title,
            subtitle: (n.content || '').slice(0, 80),
            meta: { updatedAt: n.updatedAt },
        })),
        members,
    };
};

/** Newest-first recents for the palette's "Recent" section. */
const listRecents = (userId, limit = MAX_RECENTS) =>
    RecentSearch.find({ user: userId }).sort({ lastUsedAt: -1 }).limit(limit).lean();

/**
 * Upsert one recent entry, then trim the tail.
 * Selecting the same thing twice bumps it instead of duplicating it.
 */
const recordRecent = async (userId, entry) => {
    if (!entry?.key || !entry?.label) return null;

    const doc = await RecentSearch.findOneAndUpdate(
        { user: userId, key: String(entry.key) },
        {
            $set: {
                label: entry.label,
                subtitle: entry.subtitle,
                kind: entry.kind || 'command',
                action: entry.action,
                projectId: entry.projectId || undefined,
                lastUsedAt: new Date(),
            },
            $inc: { useCount: 1 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Keep the list bounded — drop anything past the cap.
    const stale = await RecentSearch.find({ user: userId })
        .sort({ lastUsedAt: -1 })
        .skip(MAX_RECENTS)
        .select('_id')
        .lean();

    if (stale.length) {
        await RecentSearch.deleteMany({ _id: { $in: stale.map((s) => s._id) } });
    }

    return doc;
};

const clearRecents = (userId) => RecentSearch.deleteMany({ user: userId });

module.exports = { globalSearch, listRecents, recordRecent, clearRecents, MAX_RECENTS };
