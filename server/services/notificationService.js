const Notification = require('../models/Notification');
const events = require('./eventService');

/**
 * Read/write helpers for the Notification Center.
 *
 * Writes go through eventService so every notification is also pushed over
 * Socket.IO. `notifyProject` keeps its original signature — the GitHub sync
 * engine calls it on a timer and shouldn't need to change.
 */

// Legacy rows were written before `category` existed. Rather than run a
// migration, infer the bucket at read time from whatever the row does have.
const backfillCategory = (doc) => {
    const plain = doc.toObject ? doc.toObject() : doc;
    if (!plain.category || plain.category === 'system') {
        if (plain.source === 'github') plain.category = 'github';
        else if (plain.taskId) plain.category = 'task';
        else if (plain.projectId) plain.category = 'project';
    }
    return plain;
};

/**
 * Fan a notification out to every member of a project.
 * Unchanged public shape — used by githubSyncService's polling loop.
 */
const notifyProject = async (project, payload) => {
    if (!project) return [];

    const recipients = await events.resolveProjectRecipients(project);

    return events.recordNotification({
        recipients,
        project,
        taskId: payload.taskId,
        actor: payload.actor,
        // GitHub events aren't caused by the signed-in user, so nobody is excluded.
        excludeActor: !!payload.actor,
        source: payload.source || 'github',
        category: payload.category || 'github',
        type: payload.type,
        title: payload.title,
        message: payload.message,
        detail: payload.detail,
        url: payload.url,
        severity: payload.severity || 'info',
        priority: payload.priority || 'normal',
        entityType: payload.entityType,
        entityId: payload.entityId,
        dedupeKey: payload.dedupeKey,
    });
};

/**
 * Paginated, filterable, searchable list for the drawer.
 *
 * @param {string} userId
 * @param {Object} opts
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=20]
 * @param {string} [opts.filter='all']  'all' | 'unread' | 'task' | 'project' | 'github' | 'member' | 'note'
 * @param {string} [opts.search]
 */
const listForUser = async (userId, opts = {}) => {
    const page = Math.max(1, parseInt(opts.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(opts.limit, 10) || 20));
    const filter = opts.filter || 'all';
    const search = (opts.search || '').trim();

    const query = { user: userId };

    if (filter === 'unread') {
        query.read = false;
    } else if (filter !== 'all') {
        // Legacy GitHub rows may have no category at all, so match on either.
        query.$or = filter === 'github'
            ? [{ category: 'github' }, { source: 'github' }]
            : [{ category: filter }];
    }

    if (search) {
        // Escaped so a user typing "C++" doesn't blow up the regex engine.
        const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const searchClause = [{ title: rx }, { message: rx }, { detail: rx }, { actorName: rx }];
        if (query.$or) {
            query.$and = [{ $or: query.$or }, { $or: searchClause }];
            delete query.$or;
        } else {
            query.$or = searchClause;
        }
    }

    const [items, total, unreadCount] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Notification.countDocuments(query),
        Notification.countDocuments({ user: userId, read: false }),
    ]);

    return {
        items: items.map(backfillCategory),
        page,
        limit,
        total,
        unreadCount,
        hasMore: page * limit < total,
    };
};

const markRead = (userId, ids) =>
    Notification.updateMany(
        { user: userId, ...(ids?.length ? { _id: { $in: ids } } : {}), read: false },
        { $set: { read: true, readAt: new Date() } }
    );

const remove = (userId, id) => Notification.deleteOne({ user: userId, _id: id });

const clearAll = (userId) => Notification.deleteMany({ user: userId });

const unreadCount = (userId) => Notification.countDocuments({ user: userId, read: false });

module.exports = {
    notifyProject,
    listForUser,
    markRead,
    markAllRead: markRead,
    remove,
    clearAll,
    unreadCount,
    backfillCategory,
};
