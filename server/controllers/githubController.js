const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const github = require('../services/githubService');
const sync = require('../services/githubSyncService');
const notifications = require('../services/notificationService');
const events = require('../services/eventService');

/** Translates a GitHubError into the right HTTP status for the client. */
const rethrow = (res, error) => {
    res.status(error?.status && error.status < 600 ? error.status : 502);
    throw new Error(error?.message || 'GitHub request failed');
};

/** Loads a task and asserts it belongs to the project on the request. */
const loadTask = async (req, res) => {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }
    if (task.projectId.toString() !== req.project._id.toString()) {
        res.status(403);
        throw new Error('This task does not belong to the project');
    }
    if (!task.github) task.github = {};
    return task;
};

// ===========================================================================
// Repository connection
// ===========================================================================

// @desc    Validate a repo without saving it (used for live modal feedback)
// @route   POST /api/github/validate
// @access  Private
const validateRepository = asyncHandler(async (req, res) => {
    const parsed = github.parseRepoInput(req.body.repository);
    if (!parsed) {
        res.status(400);
        throw new Error('Enter a repository as "owner/repo" or a github.com URL');
    }

    try {
        const repo = await github.getRepository(parsed.owner, parsed.repo, { useCache: false });
        res.status(200).json({ valid: true, repository: repo });
    } catch (error) {
        rethrow(res, error);
    }
});

// @desc    Connect a repository to a project
// @route   POST /api/github/:projectId/connect
// @access  Private (project Admin)
const connectRepository = asyncHandler(async (req, res) => {
    const project = req.project;

    const parsed = github.parseRepoInput(req.body.repository);
    if (!parsed) {
        res.status(400);
        throw new Error('Enter a repository as "owner/repo" or a github.com URL');
    }

    let snapshot;
    try {
        snapshot = await github.getRepositorySnapshot(parsed.owner, parsed.repo, { useCache: false });
    } catch (error) {
        return rethrow(res, error);
    }

    project.github = {
        ...snapshot,
        connected: true,
        connectedAt: new Date(),
        connectedBy: req.user.email,
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
        syncError: undefined,
    };

    try {
        project.githubActivity = await github.buildActivityFeed(
            parsed.owner, parsed.repo, snapshot.defaultBranch
        );
    } catch {
        project.githubActivity = [];
    }

    await project.save();

    await notifications.notifyProject(project, {
        type: 'repo_connected',
        title: 'GitHub',
        message: `Repository ${snapshot.fullName} connected`,
        detail: `Linked to project "${project.name}"`,
        url: snapshot.repositoryUrl,
        severity: 'success',
        dedupeKey: `repo_connected:${project._id}:${snapshot.repositoryId}:${Date.now()}`,
    });

    // Timeline + live feed (notification already sent above).
    await events.recordEvent({
        project,
        actor: req.user,
        action: 'repo_connected',
        description: `Repository ${snapshot.fullName} connected`,
        entityType: 'repository',
        entityId: snapshot.repositoryId,
        entityTitle: snapshot.fullName,
        metadata: { url: snapshot.repositoryUrl },
        notify: null,
    });

    res.status(200).json({ github: project.github, activity: project.githubActivity });
});

// @desc    Disconnect the repository
// @route   DELETE /api/github/:projectId/disconnect
// @access  Private (project Admin)
const disconnectRepository = asyncHandler(async (req, res) => {
    const project = req.project;
    const previous = project.github?.fullName;

    if (project.github?.owner && project.github?.repositoryName) {
        github.clearCacheFor(project.github.owner, project.github.repositoryName);
    }

    project.github = { connected: false, syncStatus: 'not_connected' };
    project.githubActivity = [];
    await project.save();

    // Detach every task link so nothing points at a repo we no longer track.
    await Task.updateMany(
        { projectId: project._id },
        {
            $set: {
                'github.syncStatus': 'not_connected',
                'github.autoCompleted': false,
            },
            $unset: {
                'github.pullRequest': '',
                'github.issue': '',
                'github.commitHistory': '',
            },
        }
    );

    await notifications.notifyProject(project, {
        type: 'repo_disconnected',
        title: 'GitHub',
        message: 'Repository Disconnected',
        detail: previous ? `${previous} is no longer linked to "${project.name}"` : undefined,
        severity: 'warning',
        dedupeKey: `repo_disconnected:${project._id}:${Date.now()}`,
    });

    await events.recordEvent({
        project,
        actor: req.user,
        action: 'repo_disconnected',
        description: previous ? `Repository ${previous} disconnected` : 'Repository disconnected',
        entityType: 'repository',
        entityTitle: previous,
        notify: null,
    });

    res.status(200).json({ github: project.github });
});

// ===========================================================================
// Reads
// ===========================================================================

// @desc    Repository snapshot + insights for the widget / dashboard
// @route   GET /api/github/:projectId
// @access  Private (project member)
const getProjectGithub = asyncHandler(async (req, res) => {
    const project = req.project;

    if (!project.github?.connected) {
        return res.status(200).json({
            connected: false,
            github: null,
            activity: [],
            hasToken: github.hasToken(),
        });
    }

    // This is the read path — several open tabs hit it on a timer, so refresh
    // conservatively. A full sync is ~11 GitHub calls, and an unauthenticated
    // install only gets 60/hour. The background poller does the heavy lifting.
    const STALE_AFTER_MS = 3 * 60 * 1000;
    const age = project.github.lastSyncedAt
        ? Date.now() - new Date(project.github.lastSyncedAt).getTime()
        : Infinity;

    if (age > STALE_AFTER_MS) {
        // Skip the activity feed here; the dedicated /activity route and the
        // background poller keep it current.
        await sync.syncProjectRepository(project, { includeActivity: false });
    }

    res.status(200).json({
        connected: true,
        github: project.github,
        activity: project.githubActivity || [],
        hasToken: github.hasToken(),
    });
});

// @desc    Chronological repository activity feed
// @route   GET /api/github/:projectId/activity
// @access  Private (project member)
const getActivity = asyncHandler(async (req, res) => {
    const { owner, repositoryName, defaultBranch } = req.project.github;
    try {
        const feed = await github.buildActivityFeed(owner, repositoryName, defaultBranch);
        req.project.githubActivity = feed;
        await req.project.save();
        res.status(200).json(feed);
    } catch (error) {
        rethrow(res, error);
    }
});

// @desc    Commits on the default branch (or ?branch=)
// @route   GET /api/github/:projectId/commits
// @access  Private (project member)
const getCommits = asyncHandler(async (req, res) => {
    const { owner, repositoryName, defaultBranch } = req.project.github;
    try {
        const commits = await github.getCommits(owner, repositoryName, {
            branch: req.query.branch || defaultBranch,
            perPage: Math.min(Number(req.query.limit) || 20, 100),
        });
        res.status(200).json(commits);
    } catch (error) {
        rethrow(res, error);
    }
});

// @desc    Open pull requests (for the "pick a PR" dropdown)
// @route   GET /api/github/:projectId/pulls
// @access  Private (project member)
const listPullRequests = asyncHandler(async (req, res) => {
    const { owner, repositoryName } = req.project.github;
    try {
        res.status(200).json(await github.getRecentPullRequests(owner, repositoryName));
    } catch (error) {
        rethrow(res, error);
    }
});

// @desc    Recent issues (for the "pick an issue" dropdown)
// @route   GET /api/github/:projectId/issues
// @access  Private (project member)
const listIssues = asyncHandler(async (req, res) => {
    const { owner, repositoryName } = req.project.github;
    try {
        res.status(200).json(await github.getRecentIssues(owner, repositoryName));
    } catch (error) {
        rethrow(res, error);
    }
});

// ===========================================================================
// Task links
// ===========================================================================

// @desc    Attach a pull request to a task
// @route   POST /api/github/:projectId/tasks/:taskId/pull-request
// @access  Private (project member)
const attachPullRequest = asyncHandler(async (req, res) => {
    const project = req.project;
    const task = await loadTask(req, res);

    const number = github.parseNumberInput(req.body.pullRequest);
    if (!number) {
        res.status(400);
        throw new Error('Enter a PR number (e.g. 42) or a full pull request URL');
    }

    let pr;
    try {
        pr = await github.getPullRequest(
            project.github.owner, project.github.repositoryName, number, { useCache: false }
        );
    } catch (error) {
        return rethrow(res, error);
    }

    task.github.pullRequest = pr;
    task.github.syncStatus = 'synced';
    task.github.syncError = undefined;
    task.github.lastSync = new Date();

    try {
        task.github.commitHistory = await github.getPullRequestCommits(
            project.github.owner, project.github.repositoryName, number, { useCache: false }
        );
    } catch {
        task.github.commitHistory = [];
    }

    task.github.activity = task.github.activity || [];
    task.github.activity.unshift({
        type: 'pr_linked',
        message: `Linked pull request #${pr.number}`,
        actor: req.user.name,
        url: pr.url,
        timestamp: new Date(),
    });

    // Attaching an already-merged PR completes the task straight away.
    if (pr.merged && task.status !== sync.COMPLETED_STATUS) {
        task.github.statusBeforeAutoComplete = task.status;
        task.status = sync.COMPLETED_STATUS;
        task.github.autoCompleted = true;
        task.github.autoCompletedAt = pr.mergedAt || new Date();
        task.github.autoCompletedReason = `Merged Pull Request #${pr.number}`;

        await notifications.notifyProject(project, {
            taskId: task._id,
            type: 'task_auto_completed',
            title: 'GitHub',
            message: `PR #${pr.number} Merged`,
            detail: `Task "${task.title}" completed automatically`,
            url: pr.url,
            severity: 'success',
            // Distinct from the sync engine's `pr_merged:` key so that
            // detaching and re-attaching a merged PR still notifies.
            dedupeKey: `attach_merged:${task._id}:${pr.number}`,
        });
    }

    await task.save();

    await events.recordEvent({
        project,
        actor: req.user,
        action: 'pr_linked',
        description: `Linked PR #${pr.number} to ${task.title}`,
        entityType: 'pull_request',
        entityId: pr.number,
        entityTitle: pr.title,
        metadata: { url: pr.url, taskId: task._id, taskTitle: task.title },
        notify: null,
    });

    res.status(200).json(task);
});

// @desc    Remove the linked pull request
// @route   DELETE /api/github/:projectId/tasks/:taskId/pull-request
// @access  Private (project member)
const detachPullRequest = asyncHandler(async (req, res) => {
    const task = await loadTask(req, res);

    // If we completed this task automatically, undo that too.
    if (task.github.autoCompleted) {
        task.status = task.github.statusBeforeAutoComplete || 'In Progress';
        task.github.autoCompleted = false;
        task.github.autoCompletedAt = undefined;
        task.github.autoCompletedReason = undefined;
        task.github.statusBeforeAutoComplete = undefined;
    }

    task.github.pullRequest = undefined;
    task.github.commitHistory = [];
    task.github.syncStatus = task.github.issue?.number ? 'synced' : 'not_connected';
    await task.save();

    res.status(200).json(task);
});

// @desc    Attach an issue to a task
// @route   POST /api/github/:projectId/tasks/:taskId/issue
// @access  Private (project member)
const attachIssue = asyncHandler(async (req, res) => {
    const project = req.project;
    const task = await loadTask(req, res);

    const number = github.parseNumberInput(req.body.issue);
    if (!number) {
        res.status(400);
        throw new Error('Enter an issue number (e.g. 18) or a full issue URL');
    }

    let issue;
    try {
        issue = await github.getIssue(
            project.github.owner, project.github.repositoryName, number, { useCache: false }
        );
    } catch (error) {
        return rethrow(res, error);
    }

    task.github.issue = issue;
    task.github.syncStatus = 'synced';
    task.github.syncError = undefined;
    task.github.lastSync = new Date();

    task.github.activity = task.github.activity || [];
    task.github.activity.unshift({
        type: 'issue_linked',
        message: `Linked issue #${issue.number}`,
        actor: req.user.name,
        url: issue.url,
        timestamp: new Date(),
    });

    await task.save();

    await events.recordEvent({
        project,
        actor: req.user,
        action: 'issue_linked',
        description: `Linked issue #${issue.number} to ${task.title}`,
        entityType: 'issue',
        entityId: issue.number,
        entityTitle: issue.title,
        metadata: { url: issue.url, taskId: task._id, taskTitle: task.title },
        notify: null,
    });

    res.status(200).json(task);
});

// @desc    Remove the linked issue
// @route   DELETE /api/github/:projectId/tasks/:taskId/issue
// @access  Private (project member)
const detachIssue = asyncHandler(async (req, res) => {
    const task = await loadTask(req, res);
    task.github.issue = undefined;
    task.github.syncStatus = task.github.pullRequest?.number ? 'synced' : 'not_connected';
    await task.save();
    res.status(200).json(task);
});

// @desc    Force-sync a single task
// @route   POST /api/github/:projectId/tasks/:taskId/sync
// @access  Private (project member)
const syncSingleTask = asyncHandler(async (req, res) => {
    const task = await loadTask(req, res);
    const result = await sync.syncTask(task, req.project);
    res.status(200).json({ task, ...result });
});

// @desc    Force-sync the whole project (repo + all linked tasks)
// @route   POST /api/github/:projectId/sync
// @access  Private (project member)
const syncProject = asyncHandler(async (req, res) => {
    const summary = await sync.syncProjectAndTasks(req.project);
    res.status(200).json({
        github: req.project.github,
        activity: req.project.githubActivity || [],
        summary,
    });
});

// ===========================================================================
// Notifications
// ===========================================================================

// @route   GET /api/github/notifications
const getNotifications = asyncHandler(async (req, res) => {
    // Kept for backwards compatibility with the GitHub widget, which expects
    // `{ notifications, unreadCount }`. The Notification Center uses the
    // richer /api/notifications endpoint instead.
    const { items, unreadCount } = await notifications.listForUser(req.user._id, {
        limit: Math.min(Number(req.query.limit) || 50, 100),
        filter: req.query.unread === '1' ? 'unread' : 'github',
    });
    res.status(200).json({ notifications: items, unreadCount });
});

// @route   PUT /api/github/notifications/read
const readNotifications = asyncHandler(async (req, res) => {
    await notifications.markRead(req.user._id, req.body.ids);
    res.status(200).json({ success: true });
});

// @route   DELETE /api/github/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
    await notifications.remove(req.user._id, req.params.id);
    res.status(200).json({ success: true });
});

// @route   DELETE /api/github/notifications
const clearNotifications = asyncHandler(async (req, res) => {
    await notifications.clearAll(req.user._id);
    res.status(200).json({ success: true });
});

module.exports = {
    validateRepository,
    connectRepository,
    disconnectRepository,
    getProjectGithub,
    getActivity,
    getCommits,
    listPullRequests,
    listIssues,
    attachPullRequest,
    detachPullRequest,
    attachIssue,
    detachIssue,
    syncSingleTask,
    syncProject,
    getNotifications,
    readNotifications,
    deleteNotification,
    clearNotifications,
};
