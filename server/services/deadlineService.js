const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const events = require('./eventService');

/**
 * Deadline sweeper — emits "due tomorrow" and "overdue" notifications.
 *
 * Runs on a timer rather than on write, because a deadline passing isn't
 * something anybody *does*. Idempotency comes entirely from the dedupeKey:
 * it embeds the calendar day, so re-running the sweep every 30 minutes
 * produces exactly one notification per task per day.
 */

const SWEEP_INTERVAL_MS = 30 * 60 * 1000;   // 30 minutes
const DONE_STATUSES = ['Done', 'Completed'];

const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Who should hear about this task? Its assignees if it has any, otherwise
 * everyone on the project (an unassigned overdue task is the whole team's
 * problem).
 */
const recipientsForTask = async (task, project) => {
    const members = (task.members || []).filter(Boolean);
    if (members.length === 0) return events.resolveProjectRecipients(project);

    // `members` may hold user ids or emails depending on how the task was made.
    const emails = members.filter((m) => typeof m === 'string' && m.includes('@'));
    const ids = members.filter((m) => /^[0-9a-fA-F]{24}$/.test(m));

    const resolved = new Set(ids);
    if (emails.length) {
        const users = await User.find({ email: { $in: emails } }).select('_id');
        users.forEach((u) => resolved.add(u._id.toString()));
    }

    // Team entries can carry an `id` — map any email-shaped member through it.
    (project?.team || []).forEach((m) => {
        if (m.id && members.includes(m.email)) resolved.add(String(m.id));
    });

    return resolved.size ? [...resolved] : events.resolveProjectRecipients(project);
};

const sweep = async () => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = new Date(todayStart.getTime() + 86400000);
    const dayAfterStart = new Date(todayStart.getTime() + 2 * 86400000);

    try {
        const candidates = await Task.find({
            status: { $nin: DONE_STATUSES },
            deadline: { $ne: null, $lt: dayAfterStart },
        }).select('title projectId deadline members status').lean();

        if (candidates.length === 0) return;

        // One project lookup per distinct project, not per task.
        const projectIds = [...new Set(candidates.map((t) => String(t.projectId)))];
        const projects = await Project.find({ _id: { $in: projectIds } }).select('user team name').lean();
        const projectById = new Map(projects.map((p) => [String(p._id), p]));

        for (const task of candidates) {
            const project = projectById.get(String(task.projectId));
            if (!project) continue;

            const deadline = new Date(task.deadline);
            const isOverdue = deadline < todayStart;
            const isDueTomorrow = deadline >= tomorrowStart && deadline < dayAfterStart;
            if (!isOverdue && !isDueTomorrow) continue;

            const recipients = await recipientsForTask(task, project);
            if (recipients.length === 0) continue;

            await events.recordNotification({
                recipients,
                excludeActor: false,        // system event — nobody to exclude
                project,
                taskId: task._id,
                type: isOverdue ? 'task_overdue' : 'task_due_soon',
                category: 'task',
                source: 'system',
                title: isOverdue ? 'Task Overdue' : 'Due Tomorrow',
                message: isOverdue
                    ? `${task.title} is overdue`
                    : `${task.title} is due tomorrow`,
                detail: project.name,
                severity: isOverdue ? 'error' : 'warning',
                priority: isOverdue ? 'urgent' : 'high',
                entityType: 'task',
                entityId: task._id,
                // Same task, same day => same key => inserted at most once.
                dedupeKey: `deadline:${task._id}:${isOverdue ? 'overdue' : 'due'}:${dayKey(now)}`,
            });
        }
    } catch (error) {
        console.error('[Deadlines] sweep failed:', error.message);
    }
};

let timer = null;

const startPolling = () => {
    if (timer) return timer;
    // Delay the first pass so it doesn't race the Mongo connection on boot.
    setTimeout(sweep, 20 * 1000);
    timer = setInterval(sweep, SWEEP_INTERVAL_MS);
    console.log('[Deadlines] sweeper started (every 30m)');
    return timer;
};

const stopPolling = () => {
    if (timer) clearInterval(timer);
    timer = null;
};

module.exports = { startPolling, stopPolling, sweep };
