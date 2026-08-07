/**
 * githubSyncService.js
 * --------------------
 * The brain of the integration. Everything that reconciles GitHub state with
 * ProSync state lives here so the controller and the background poller share
 * exactly one implementation.
 *
 * Responsibilities:
 *   - refresh a project's repository snapshot + activity feed
 *   - refresh a task's linked PR / issue / commits
 *   - auto-complete a task when its PR merges, and revert when it reopens
 *   - emit notifications for anything a human would want to know about
 */

const Project = require('../models/Project');
const Task = require('../models/Task');
const github = require('./githubService');
const notifications = require('./notificationService');

const COMPLETED_STATUS = 'Done';
const REOPENED_STATUS = 'In Progress';

// ---------------------------------------------------------------------------
// Project-level sync
// ---------------------------------------------------------------------------

/**
 * Pull a fresh snapshot of the connected repo into project.github and rebuild
 * the activity feed. Never throws — failures are recorded on the document so
 * the UI can show a red "Failed" indicator with the reason.
 */
const syncProjectRepository = async (project, { includeActivity = true } = {}) => {
    if (!project?.github?.connected) return project;

    const { owner, repositoryName } = project.github;
    if (!owner || !repositoryName) return project;

    try {
        const snapshot = await github.getRepositorySnapshot(owner, repositoryName, { useCache: false });

        Object.assign(project.github, snapshot, {
            connected: true,
            lastSyncedAt: new Date(),
            syncStatus: 'synced',
            syncError: undefined,
        });

        if (includeActivity) {
            try {
                project.githubActivity = await github.buildActivityFeed(
                    owner,
                    repositoryName,
                    snapshot.defaultBranch
                );
            } catch {
                // A failed feed shouldn't invalidate an otherwise good snapshot.
            }
        }

        await project.save();
    } catch (error) {
        project.github.syncStatus = 'failed';
        project.github.syncError = error.message;
        project.github.lastSyncedAt = new Date();
        await project.save();

        await notifications.notifyProject(project, {
            type: 'sync_failed',
            title: 'GitHub',
            message: `Could not sync ${owner}/${repositoryName}`,
            detail: error.message,
            severity: 'error',
            // One alert per repo per hour, not one every poll.
            dedupeKey: `sync_failed:${project._id}:${new Date().toISOString().slice(0, 13)}`,
        });
    }

    return project;
};

// ---------------------------------------------------------------------------
// Task-level sync
// ---------------------------------------------------------------------------

const pushActivity = (task, entry) => {
    task.github.activity = task.github.activity || [];
    task.github.activity.unshift({ ...entry, timestamp: entry.timestamp || new Date() });
    // Keep the panel readable and the document small.
    task.github.activity = task.github.activity.slice(0, 30);
};

/**
 * Reconcile one task against GitHub.
 *
 * Returns { changed, autoCompleted, reverted } so callers can decide whether to
 * bother writing to the DB / telling the user.
 */
const syncTask = async (task, project, { emitNotifications = true } = {}) => {
    const result = { changed: false, autoCompleted: false, reverted: false };

    if (!task?.github) return result;
    if (!project?.github?.connected) return result;

    const { owner, repositoryName } = project.github;
    const linkedPR = task.github.pullRequest;
    const linkedIssue = task.github.issue;

    if (!linkedPR?.number && !linkedIssue?.number) return result;

    task.github.syncStatus = 'pending';

    try {
        // ---- Pull request -------------------------------------------------
        if (linkedPR?.number) {
            const wasMerged = !!linkedPR.merged;
            const fresh = await github.getPullRequest(owner, repositoryName, linkedPR.number, { useCache: false });

            task.github.pullRequest = fresh;
            result.changed = true;

            // Commits on the PR branch (Feature 6)
            try {
                task.github.commitHistory = await github.getPullRequestCommits(
                    owner, repositoryName, linkedPR.number, { useCache: false }
                );
            } catch { /* commit list is nice-to-have */ }

            // --- Feature 5: auto-complete on merge ---------------------------
            if (fresh.merged && !wasMerged) {
                if (task.status !== COMPLETED_STATUS) {
                    task.github.statusBeforeAutoComplete = task.status;
                    task.status = COMPLETED_STATUS;
                    task.github.autoCompleted = true;
                    task.github.autoCompletedAt = fresh.mergedAt || new Date();
                    task.github.autoCompletedReason = `Merged Pull Request #${fresh.number}`;
                    result.autoCompleted = true;
                }

                pushActivity(task, {
                    type: 'pr_merged',
                    message: `Pull request #${fresh.number} merged`,
                    actor: fresh.mergedBy || fresh.author,
                    url: fresh.url,
                    timestamp: fresh.mergedAt,
                });

                if (emitNotifications) {
                    await notifications.notifyProject(project, {
                        taskId: task._id,
                        type: 'pr_merged',
                        title: 'GitHub',
                        message: `PR #${fresh.number} Merged`,
                        detail: `Task "${task.title}" completed automatically`,
                        url: fresh.url,
                        severity: 'success',
                        dedupeKey: `pr_merged:${task._id}:${fresh.number}`,
                    });
                }
            }

            // --- PR reopened: undo the automatic completion -------------------
            if (!fresh.merged && fresh.state === 'open' && task.github.autoCompleted) {
                task.status = task.github.statusBeforeAutoComplete || REOPENED_STATUS;
                task.github.autoCompleted = false;
                task.github.autoCompletedAt = undefined;
                task.github.autoCompletedReason = undefined;
                task.github.statusBeforeAutoComplete = undefined;
                result.reverted = true;

                pushActivity(task, {
                    type: 'pr_reopened',
                    message: `Pull request #${fresh.number} reopened`,
                    actor: fresh.author,
                    url: fresh.url,
                });

                if (emitNotifications) {
                    await notifications.notifyProject(project, {
                        taskId: task._id,
                        type: 'pr_reopened',
                        title: 'GitHub',
                        message: `PR #${fresh.number} Reopened`,
                        detail: `Task "${task.title}" moved back to ${task.status}`,
                        url: fresh.url,
                        severity: 'warning',
                        dedupeKey: `pr_reopened:${task._id}:${fresh.number}:${fresh.updatedAt}`,
                    });
                }
            }
        }

        // ---- Issue ---------------------------------------------------------
        if (linkedIssue?.number) {
            const wasClosed = linkedIssue.state === 'closed';
            const fresh = await github.getIssue(owner, repositoryName, linkedIssue.number, { useCache: false });

            task.github.issue = fresh;
            result.changed = true;

            if (fresh.state === 'closed' && !wasClosed) {
                pushActivity(task, {
                    type: 'issue_closed',
                    message: `Issue #${fresh.number} closed`,
                    actor: fresh.creator,
                    url: fresh.url,
                    timestamp: fresh.closedAt,
                });

                if (emitNotifications) {
                    await notifications.notifyProject(project, {
                        taskId: task._id,
                        type: 'issue_closed',
                        title: 'GitHub',
                        message: `Issue #${fresh.number} Closed`,
                        detail: `Task "${task.title}" updated`,
                        url: fresh.url,
                        severity: 'info',
                        dedupeKey: `issue_closed:${task._id}:${fresh.number}`,
                    });
                }
            }

            if (fresh.state === 'open' && wasClosed) {
                pushActivity(task, {
                    type: 'issue_reopened',
                    message: `Issue #${fresh.number} reopened`,
                    actor: fresh.creator,
                    url: fresh.url,
                });
            }
        }

        task.github.syncStatus = 'synced';
        task.github.syncError = undefined;
        task.github.lastSync = new Date();
        await task.save();
    } catch (error) {
        task.github.syncStatus = 'failed';
        task.github.syncError = error.message;
        task.github.lastSync = new Date();
        await task.save();
    }

    return result;
};

// ---------------------------------------------------------------------------
// Bulk / background sync
// ---------------------------------------------------------------------------

/** Sync one project's repo and every task in it that has a GitHub link. */
const syncProjectAndTasks = async (project, options = {}) => {
    await syncProjectRepository(project, options);

    const tasks = await Task.find({
        projectId: project._id,
        $or: [
            { 'github.pullRequest.number': { $exists: true, $ne: null } },
            { 'github.issue.number': { $exists: true, $ne: null } },
        ],
    });

    const summary = { tasks: tasks.length, autoCompleted: 0, reverted: 0 };

    for (const task of tasks) {
        const r = await syncTask(task, project, options);
        if (r.autoCompleted) summary.autoCompleted += 1;
        if (r.reverted) summary.reverted += 1;
    }

    return summary;
};

/** Entry point for the polling interval — walks every connected project. */
const syncAllConnectedProjects = async () => {
    const projects = await Project.find({ 'github.connected': true });
    if (projects.length === 0) return { projects: 0 };

    let autoCompleted = 0;
    for (const project of projects) {
        try {
            const summary = await syncProjectAndTasks(project);
            autoCompleted += summary.autoCompleted;
        } catch (error) {
            console.error(`[GitHub Sync] ${project.name}:`, error.message);
        }
    }

    return { projects: projects.length, autoCompleted };
};

// ---------------------------------------------------------------------------
// Polling loop
// ---------------------------------------------------------------------------

let timer = null;

const startPolling = () => {
    const minutes = Number(process.env.GITHUB_SYNC_INTERVAL_MINUTES || 5);

    if (minutes <= 0) {
        console.log('[GitHub Sync] Polling disabled (GITHUB_SYNC_INTERVAL_MINUTES=0)');
        return;
    }
    if (timer) return;

    const intervalMs = minutes * 60 * 1000;

    const tick = async () => {
        try {
            const result = await syncAllConnectedProjects();
            if (result.projects > 0) {
                console.log(
                    `[GitHub Sync] Synced ${result.projects} project(s)` +
                    (result.autoCompleted ? `, auto-completed ${result.autoCompleted} task(s)` : '')
                );
            }
        } catch (error) {
            console.error('[GitHub Sync] Poll failed:', error.message);
        }
    };

    // Give Mongo a moment to connect before the first pass.
    setTimeout(tick, 20 * 1000);
    timer = setInterval(tick, intervalMs);
    if (timer.unref) timer.unref();

    console.log(
        `[GitHub Sync] Polling every ${minutes} min` +
        (github.hasToken() ? '' : ' (no GITHUB_TOKEN set — limited to 60 req/hr)')
    );
};

const stopPolling = () => {
    if (timer) clearInterval(timer);
    timer = null;
};

module.exports = {
    syncProjectRepository,
    syncTask,
    syncProjectAndTasks,
    syncAllConnectedProjects,
    startPolling,
    stopPolling,
    COMPLETED_STATUS,
};
