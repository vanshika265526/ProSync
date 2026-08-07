const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const events = require('../services/eventService');

const DONE_STATUSES = ['Done', 'Completed'];
const isDone = (status) => DONE_STATUSES.includes(status);

/**
 * Turn whatever `members` holds (user ids, emails, or the literal 'me') into
 * real User ids, using the project's team array as a lookup table.
 */
const resolveMemberIds = async (members = [], project) => {
    const values = members.filter(Boolean).map(String);
    if (values.length === 0) return [];

    const ids = new Set(values.filter((v) => /^[0-9a-fA-F]{24}$/.test(v)));
    const emails = values.filter((v) => v.includes('@'));

    // Map team entries both ways — a task may store the team `id` or the email.
    (project?.team || []).forEach((m) => {
        if (!m.email) return;
        if (values.includes(String(m.id)) && m.email) emails.push(m.email);
        if (values.includes(m.email) && m.id) ids.add(String(m.id));
    });

    if (emails.length) {
        const users = await User.find({ email: { $in: [...new Set(emails)] } }).select('_id');
        users.forEach((u) => ids.add(u._id.toString()));
    }

    return [...ids];
};

/** Only the pieces of an update that actually changed. */
const diffKeys = (before, body) =>
    Object.keys(body).filter((key) => {
        const a = before[key];
        const b = body[key];
        if (a instanceof Date || b instanceof Date) {
            return new Date(a).getTime() !== new Date(b).getTime();
        }
        if (typeof a === 'object' || typeof b === 'object') {
            return JSON.stringify(a) !== JSON.stringify(b);
        }
        return a !== b;
    });

// @desc    Get all tasks for a project
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.query;

    if (!projectId) {
        // Fallback to older behavior if no projectId is provided
        const tasks = await Task.find({ user: req.user._id });
        return res.status(200).json(tasks);
    }

    // Check if user is in the project team
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const isMember = project.user.toString() === req.user._id.toString() ||
        project.team.some(member => member.email === req.user.email);

    if (!isMember) {
        res.status(401);
        throw new Error('Not authorized to view tasks for this project');
    }

    const tasks = await Task.find({ projectId });
    res.status(200).json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { projectId, title, description, status, priority, deadline, members, tags, subtasks } = req.body;

    if (!projectId || !title) {
        res.status(400);
        throw new Error('Please add a project ID and task title');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Role check: Only Admins can create tasks
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isAdmin = project.user.toString() === req.user._id.toString() || userInTeam?.role === 'Admin';

    if (!isAdmin) {
        res.status(403);
        throw new Error('Only project Admins can create tasks');
    }

    const task = await Task.create({
        user: req.user._id,
        projectId,
        title,
        description,
        status,
        priority,
        deadline,
        members,
        tags,
        subtasks,
    });

    // --- Timeline / feed / inbox ---
    await events.recordEvent({
        project,
        actor: req.user,
        action: 'task_created',
        description: `Created ${task.title}`,
        entityType: 'task',
        entityId: task._id,
        entityTitle: task.title,
        metadata: { taskId: task._id, status: task.status, priority: task.priority },
    });

    // Assignees get a personal notification on top of the shared feed entry.
    const assignees = await resolveMemberIds(members, project);
    if (assignees.length) {
        await events.recordNotification({
            recipients: assignees,
            project,
            taskId: task._id,
            actor: req.user,
            type: 'task_assigned',
            category: 'task',
            title: 'Task Assigned',
            message: `${req.user.name} assigned you ${task.title}`,
            detail: project.name,
            severity: 'info',
            priority: task.priority === 'High' ? 'high' : 'normal',
            entityType: 'task',
            entityId: task._id,
        });
    }

    if ((subtasks || []).length) {
        await events.recordHistory({
            project,
            actor: req.user,
            action: 'subtask_added',
            description: `Added ${subtasks.length} subtask${subtasks.length > 1 ? 's' : ''} to ${task.title}`,
            entityType: 'subtask',
            entityId: task._id,
            entityTitle: task.title,
            category: 'task',
        });
    }

    res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const project = await Project.findById(task.projectId);

    // Check if user is in team
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isMember = project.user.toString() === req.user._id.toString() || !!userInTeam;

    if (!isMember) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const isAdmin = project.user.toString() === req.user._id.toString() || userInTeam?.role === 'Admin';

    // If member but not admin, they can only update status or subtasks
    // This is a soft check, in a real app we'd be more granular
    if (!isAdmin && (req.body.title || req.body.description || req.body.projectId)) {
        res.status(403);
        throw new Error('Members can only update task status and progress');
    }

    // Snapshot before the write so we can describe what actually changed.
    const before = task.toObject();

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    // Recording is best-effort and must never fail the update itself.
    try {
        await recordTaskChanges({ before, after: updatedTask, body: req.body, project, actor: req.user });
    } catch (error) {
        console.error('[Tasks] event recording failed:', error.message);
    }

    res.status(200).json(updatedTask);
});

/**
 * Translate a task diff into timeline entries.
 *
 * Split out of updateTask so the branching stays readable: each field that
 * matters gets its own verb, and everything else collapses into a single
 * generic "updated" entry rather than spamming the feed.
 */
const recordTaskChanges = async ({ before, after, body, project, actor }) => {
    const changed = diffKeys(before, body);
    if (changed.length === 0) return;

    const title = after.title;
    const common = { project, actor, entityType: 'task', entityId: after._id, entityTitle: title };

    // --- Status ---
    if (changed.includes('status')) {
        const wasDone = isDone(before.status);
        const nowDone = isDone(after.status);

        if (!wasDone && nowDone) {
            await events.recordEvent({
                ...common,
                action: 'task_completed',
                description: `${title} completed`,
                field: 'status',
                oldValue: before.status,
                newValue: after.status,
                notify: {
                    type: 'task_completed',
                    title: 'Task Completed',
                    message: `${title} completed`,
                    detail: project.name,
                    severity: 'success',
                    entityType: 'task',
                    entityId: after._id,
                },
            });
        } else if (wasDone && !nowDone) {
            await events.recordEvent({
                ...common,
                action: 'task_reopened',
                description: `${title} reopened`,
                field: 'status',
                oldValue: before.status,
                newValue: after.status,
            });
        } else {
            await events.recordEvent({
                ...common,
                action: 'task_moved',
                description: `Moved ${title} to ${after.status}`,
                field: 'status',
                oldValue: before.status,
                newValue: after.status,
            });
        }
    }

    // --- Priority ---
    if (changed.includes('priority')) {
        await events.recordEvent({
            ...common,
            action: 'priority_changed',
            description: `Priority of ${title} changed from ${before.priority} to ${after.priority}`,
            field: 'priority',
            oldValue: before.priority,
            newValue: after.priority,
        });
    }

    // --- Deadline ---
    if (changed.includes('deadline')) {
        const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'none');
        await events.recordEvent({
            ...common,
            action: 'deadline_changed',
            description: `Deadline of ${title} moved from ${fmt(before.deadline)} to ${fmt(after.deadline)}`,
            field: 'deadline',
            oldValue: before.deadline,
            newValue: after.deadline,
        });
    }

    // --- Assignment ---
    if (changed.includes('members')) {
        const beforeSet = new Set((before.members || []).map(String));
        const added = (after.members || []).map(String).filter((m) => !beforeSet.has(m));

        if (added.length) {
            await events.recordEvent({
                ...common,
                action: 'task_assigned',
                description: `Assigned ${title} to ${added.length} member${added.length > 1 ? 's' : ''}`,
                field: 'members',
                oldValue: before.members,
                newValue: after.members,
            });

            const recipients = await resolveMemberIds(added, project);
            if (recipients.length) {
                await events.recordNotification({
                    recipients,
                    project,
                    taskId: after._id,
                    actor,
                    type: 'task_assigned',
                    category: 'task',
                    title: 'Task Assigned',
                    message: `${actor.name} assigned you ${title}`,
                    detail: project.name,
                    severity: 'info',
                    priority: after.priority === 'High' ? 'high' : 'normal',
                    entityType: 'task',
                    entityId: after._id,
                });
            }
        }
    }

    // --- Subtasks ---
    if (changed.includes('subtasks')) {
        const beforeSubs = before.subtasks || [];
        const afterSubs = after.subtasks || [];
        const doneBefore = beforeSubs.filter((s) => s.completed).length;
        const doneAfter = afterSubs.filter((s) => s.completed).length;

        if (afterSubs.length > beforeSubs.length) {
            const added = afterSubs[afterSubs.length - 1];
            await events.recordEvent({
                ...common,
                action: 'subtask_added',
                description: `Added subtask "${added?.title || 'Untitled'}" to ${title}`,
                entityType: 'subtask',
                category: 'task',
            });
        } else if (afterSubs.length < beforeSubs.length) {
            await events.recordEvent({
                ...common,
                action: 'subtask_removed',
                description: `Removed a subtask from ${title}`,
                entityType: 'subtask',
                category: 'task',
            });
        } else if (doneAfter > doneBefore) {
            const justDone = afterSubs.find((s, i) => s.completed && !beforeSubs[i]?.completed);
            await events.recordEvent({
                ...common,
                action: 'subtask_completed',
                description: `Completed subtask "${justDone?.title || 'Untitled'}" in ${title}`,
                entityType: 'subtask',
                category: 'task',
            });
        }
    }

    // --- Labels ---
    if (changed.includes('tags') && (after.tags || []).length > (before.tags || []).length) {
        await events.recordEvent({
            ...common,
            action: 'labels_added',
            description: `Updated labels on ${title}`,
            entityType: 'label',
            category: 'task',
        });
    }

    // --- Everything else, folded into one line ---
    const handled = ['status', 'priority', 'deadline', 'members', 'subtasks', 'tags'];
    const rest = changed.filter((k) => !handled.includes(k) && k !== 'github');
    if (rest.length) {
        await events.recordEvent({
            ...common,
            action: 'task_updated',
            description: `Updated ${rest.join(', ')} on ${title}`,
            field: rest.join(','),
        });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const project = await Project.findById(task.projectId);
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isAdmin = project.user.toString() === req.user._id.toString() || userInTeam?.role === 'Admin';

    if (!isAdmin) {
        res.status(403);
        throw new Error('Only project Admins can delete tasks');
    }

    const title = task.title;
    await task.deleteOne();

    await events.recordEvent({
        project,
        actor: req.user,
        action: 'task_deleted',
        description: `Deleted ${title}`,
        entityType: 'task',
        entityId: req.params.id,
        entityTitle: title,
    });

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};
