const Activity = require('../models/Activity');
const History = require('../models/History');
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const User = require('../models/User');
const realtime = require('./realtimeService');

/**
 * The single entry point every feature uses to say "something happened".
 *
 * One call fans out to up to three places:
 *   History      — permanent, field-level audit log for the project timeline
 *   Activity     — transient, denormalised feed for the live sidebar
 *   Notification — per-recipient inbox rows
 * …and then pushes the freshly written documents over Socket.IO.
 *
 * Design rule: **recording an event must never break the request that caused
 * it.** Everything here is wrapped so a failed write logs and returns instead
 * of bubbling a 500 up to a user who just renamed a task.
 */

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

// Maps an action verb to the filter bucket used by the UI chips.
const CATEGORY_BY_ACTION = {
    // project
    project_created: 'project', project_updated: 'project', project_archived: 'project',
    project_deleted: 'project',
    // task
    task_created: 'task', task_updated: 'task', task_deleted: 'task',
    task_completed: 'task', task_reopened: 'task', task_moved: 'task',
    task_assigned: 'task', task_unassigned: 'task',
    priority_changed: 'task', deadline_changed: 'task',
    subtask_added: 'task', subtask_completed: 'task', subtask_removed: 'task',
    labels_added: 'task', attachment_uploaded: 'task',
    task_due_soon: 'task', task_overdue: 'task',
    // member
    member_invited: 'member', member_joined: 'member', member_removed: 'member',
    member_role_changed: 'member', user_login: 'member',
    // note
    note_created: 'note', note_updated: 'note', note_deleted: 'note',
    // comment
    comment_added: 'comment',
    // github
    repo_connected: 'github', repo_disconnected: 'github', repo_synced: 'github',
    pr_linked: 'github', pr_merged: 'github', pr_reopened: 'github',
    issue_linked: 'github', issue_closed: 'github', issue_reopened: 'github',
    task_auto_completed: 'github', sync_failed: 'github',
    // sprint
    sprint_started: 'sprint', sprint_completed: 'sprint',
};

const ENTITY_BY_CATEGORY = {
    task: 'task', project: 'project', member: 'member',
    note: 'note', github: 'repository', comment: 'comment', sprint: 'sprint',
};

const categoryFor = (action, fallback = 'system') => CATEGORY_BY_ACTION[action] || fallback;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const idOf = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    return value.toString();
};

const defaultAvatar = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=7D00FF&color=fff`;

/** Normalise whatever the caller passed as `actor` into a snapshot. */
const actorSnapshot = (actor) => {
    if (!actor) return { actorName: 'ProSync', actorEmail: null, actorAvatar: null, userId: null };
    return {
        userId: idOf(actor),
        actorName: actor.name || 'Someone',
        actorEmail: actor.email || null,
        actorAvatar: actor.avatar || defaultAvatar(actor.name),
    };
};

/**
 * Resolve a project's team (stored as emails) to real User ids.
 * The creator is always included — legacy projects may predate the team array.
 */
const resolveProjectRecipients = async (project) => {
    if (!project) return [];

    const doc = project.team || project.user
        ? project
        : await Project.findById(idOf(project)).select('user team');

    if (!doc) return [];

    const emails = [...new Set((doc.team || []).map((m) => m.email).filter(Boolean))];
    const users = emails.length ? await User.find({ email: { $in: emails } }).select('_id') : [];

    const ids = users.map((u) => u._id.toString());
    const creator = idOf(doc.user);
    if (creator && !ids.includes(creator)) ids.push(creator);

    return ids;
};

// ---------------------------------------------------------------------------
// Writers
// ---------------------------------------------------------------------------

/** Permanent audit row + realtime push to the project room. */
const recordHistory = async (payload) => {
    try {
        const {
            project, actor, action, description,
            entityType, entityId, entityTitle,
            field, oldValue, newValue, metadata, category,
        } = payload;

        const projectId = idOf(project);
        if (!projectId || !action || !description) return null;

        const snap = actorSnapshot(actor);
        const cat = category || categoryFor(action, 'project');

        const doc = await History.create({
            project: projectId,
            user: snap.userId || undefined,
            actorName: snap.actorName,
            actorEmail: snap.actorEmail,
            actorAvatar: snap.actorAvatar,
            action,
            description,
            entityType: entityType || ENTITY_BY_CATEGORY[cat] || 'project',
            entityId: entityId ? String(entityId) : undefined,
            entityTitle,
            category: cat,
            field,
            oldValue,
            newValue,
            metadata: metadata || {},
        });

        realtime.emitToProject(projectId, 'history:new', doc.toObject());
        return doc;
    } catch (error) {
        console.error('[Events] history write failed:', error.message);
        return null;
    }
};

/** Transient feed row + realtime push to the project room. */
const recordActivity = async (payload) => {
    try {
        const { project, actor, action, description, category, metadata } = payload;
        if (!action || !description) return null;

        const projectId = idOf(project);
        const snap = actorSnapshot(actor);

        const doc = await Activity.create({
            project: projectId || undefined,
            user: snap.userId || undefined,
            actorName: snap.actorName,
            actorEmail: snap.actorEmail,
            actorAvatar: snap.actorAvatar,
            action,
            description,
            category: category || categoryFor(action),
            metadata: metadata || {},
        });

        if (projectId) realtime.emitToProject(projectId, 'activity:new', doc.toObject());
        return doc;
    } catch (error) {
        console.error('[Events] activity write failed:', error.message);
        return null;
    }
};

/**
 * Insert one notification per recipient and push each to its owner's channel.
 *
 * `dedupeKey` is namespaced per-user before insert, so the unique
 * (user, dedupeKey) index turns a repeated emit into a silent skip rather
 * than a duplicate row — that's what makes this safe to call from pollers.
 */
const recordNotification = async (payload) => {
    try {
        const {
            recipients = [], project, taskId, actor, type, title, message, detail,
            source, category, severity, priority, url, dedupeKey, entityType, entityId,
            excludeActor = true,
        } = payload;

        if (!type || !title) return [];

        const snap = actorSnapshot(actor);
        const cat = category || categoryFor(type);

        let ids = [...new Set(recipients.map(idOf).filter(Boolean))];
        if (excludeActor && snap.userId) ids = ids.filter((id) => id !== snap.userId);
        if (ids.length === 0) return [];

        const base = {
            projectId: idOf(project) || undefined,
            taskId: taskId ? idOf(taskId) : undefined,
            source: source || (cat === 'github' ? 'github' : 'system'),
            category: cat,
            type,
            title,
            message,
            detail,
            actorName: snap.actorName,
            actorEmail: snap.actorEmail,
            actorAvatar: snap.actorAvatar,
            entityType: entityType || '',
            entityId: entityId ? String(entityId) : undefined,
            url,
            severity: severity || 'info',
            priority: priority || 'normal',
        };

        const docs = ids.map((userId) => ({
            ...base,
            user: userId,
            dedupeKey: dedupeKey ? `${userId}:${dedupeKey}` : undefined,
        }));

        let inserted = [];
        try {
            // ordered:false => duplicates are skipped, the rest still insert.
            inserted = await Notification.insertMany(docs, { ordered: false });
        } catch (error) {
            // E11000 just means we already told these people. Anything else is real.
            if (error?.code === 11000 || error?.writeErrors) {
                inserted = error.insertedDocs || [];
            } else {
                throw error;
            }
        }

        for (const doc of inserted) {
            realtime.emitToUser(doc.user, 'notification:new', doc.toObject ? doc.toObject() : doc);
        }
        return inserted;
    } catch (error) {
        console.error('[Events] notification write failed:', error.message);
        return [];
    }
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record one event across every surface it belongs on.
 *
 * @param {Object}  o
 * @param {Object}  o.project        Project document or id
 * @param {Object}  o.actor          req.user (or omit for system events)
 * @param {string}  o.action         verb, e.g. 'task_completed'
 * @param {string}  o.description    feed/timeline sentence
 * @param {boolean} [o.history=true]
 * @param {boolean} [o.activity=true]
 * @param {Object|false} [o.notify]  notification options, or omit to skip
 */
const recordEvent = async (o = {}) => {
    const {
        project, actor, action, description,
        entityType, entityId, entityTitle,
        field, oldValue, newValue, metadata,
        category,
        history = true,
        activity = true,
        notify = null,
    } = o;

    if (!action || !description) return {};

    const cat = category || categoryFor(action);
    const shared = {
        project, actor, action, description, category: cat,
        entityType, entityId, entityTitle, field, oldValue, newValue, metadata,
    };

    const results = await Promise.all([
        history ? recordHistory(shared) : null,
        activity ? recordActivity(shared) : null,
    ]);

    let notifications = [];
    if (notify) {
        // `recipients: 'team'` is the common case — resolve it lazily so
        // events that notify nobody never touch the User collection.
        let recipients = notify.recipients;
        if (!recipients || recipients === 'team') {
            recipients = await resolveProjectRecipients(project);
        }

        notifications = await recordNotification({
            ...notify,
            recipients,
            project,
            actor,
            category: notify.category || cat,
            type: notify.type || action,
            entityType: notify.entityType || entityType,
            entityId: notify.entityId || entityId,
        });
    }

    return { history: results[0], activity: results[1], notifications };
};

module.exports = {
    recordEvent,
    recordHistory,
    recordActivity,
    recordNotification,
    resolveProjectRecipients,
    categoryFor,
    CATEGORY_BY_ACTION,
};
