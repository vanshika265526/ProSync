import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import githubService, { githubErrorMessage } from '../services/githubService';
import { useDashboard } from './DashboardContext';
import { useToast } from './ToastContext';

const GithubContext = createContext(null);

export const useGithub = () => {
    const ctx = useContext(GithubContext);
    if (!ctx) throw new Error('useGithub must be used within a GithubProvider');
    return ctx;
};

// How often the client re-pulls repo state. The server polls independently;
// this just keeps the open tab fresh.
const REFRESH_MS = 3 * 60 * 1000;
const NOTIFICATION_MS = 60 * 1000;

export const GithubProvider = ({ children }) => {
    const {
        activeProjectId,
        currentUserRole,
        isDemoMode,
        authToken,
        applyTaskUpdate,
        applyProjectUpdate,
    } = useDashboard();
    const toast = useToast();

    const [repo, setRepo] = useState(null);
    const [activity, setActivity] = useState([]);
    const [connected, setConnected] = useState(false);
    const [hasToken, setHasToken] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [syncing, setSyncing] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Guards against a slow response for project A landing after the user has
    // already switched to project B.
    const requestProjectRef = useRef(null);

    const canManage = currentUserRole === 'Admin';
    const enabled = !!activeProjectId && !!authToken && !isDemoMode;

    // ---------------------------------------------------------------- load
    const load = useCallback(async ({ refresh = false, silent = false } = {}) => {
        if (!enabled) {
            setRepo(null);
            setActivity([]);
            setConnected(false);
            return;
        }

        const projectId = activeProjectId;
        requestProjectRef.current = projectId;

        if (!silent) setLoading(true);
        setError('');

        try {
            const data = await githubService.getProjectGithub(projectId, authToken, { refresh });
            if (requestProjectRef.current !== projectId) return;   // stale response

            setConnected(!!data.connected);
            setRepo(data.github || null);
            setActivity(data.activity || []);
            setHasToken(data.hasToken !== false);
        } catch (err) {
            if (requestProjectRef.current !== projectId) return;
            setError(githubErrorMessage(err));
        } finally {
            if (requestProjectRef.current === projectId && !silent) setLoading(false);
        }
    }, [enabled, activeProjectId, authToken]);

    // Reload whenever the active project changes, then poll quietly.
    useEffect(() => {
        setRepo(null);
        setActivity([]);
        setConnected(false);
        load();
    }, [load]);

    useEffect(() => {
        if (!enabled) return;
        const id = setInterval(() => load({ refresh: true, silent: true }), REFRESH_MS);
        return () => clearInterval(id);
    }, [enabled, load]);

    // ------------------------------------------------------------ mutations
    // Note: connect() intentionally lets errors propagate — GithubModal renders
    // them inline next to the input, which is more useful than a toast there.
    const connect = useCallback(async (repository) => {
        const data = await githubService.connectRepository(activeProjectId, repository, authToken);
        setConnected(true);
        setRepo(data.github);
        setActivity(data.activity || []);
        applyProjectUpdate(activeProjectId, { github: data.github });
        toast.success(`${data.github.fullName} is now linked to this project.`, { title: 'Repository connected' });
        return data;
    }, [activeProjectId, authToken, applyProjectUpdate, toast]);

    const disconnect = useCallback(async () => {
        try {
            const data = await githubService.disconnectRepository(activeProjectId, authToken);
            setConnected(false);
            setRepo(null);
            setActivity([]);
            applyProjectUpdate(activeProjectId, { github: data.github });
            toast.warning('Repository disconnected. Task links were removed.', { title: 'GitHub' });
            return data;
        } catch (err) {
            toast.error(githubErrorMessage(err), { title: 'Could not disconnect' });
            throw err;
        }
    }, [activeProjectId, authToken, applyProjectUpdate, toast]);

    const syncNow = useCallback(async () => {
        if (!connected || syncing) return;
        setSyncing(true);
        try {
            const data = await githubService.syncProject(activeProjectId, authToken);
            setRepo(data.github);
            setActivity(data.activity || []);
            applyProjectUpdate(activeProjectId, { github: data.github });

            const done = data.summary?.autoCompleted || 0;
            if (done > 0) {
                toast.success(
                    `${done} task${done > 1 ? 's' : ''} completed automatically from merged pull requests.`,
                    { title: 'Synced' }
                );
            } else {
                toast.info('Repository is up to date.', { title: 'Synced' });
            }
            return data;
        } catch (err) {
            toast.error(githubErrorMessage(err), { title: 'Sync failed' });
            throw err;
        } finally {
            setSyncing(false);
        }
    }, [connected, syncing, activeProjectId, authToken, applyProjectUpdate, toast]);

    // ----------------------------------------------------------- task links
    const attachPullRequest = useCallback(async (taskId, value) => {
        const task = await githubService.attachPullRequest(activeProjectId, taskId, value, authToken);
        applyTaskUpdate(task);
        const pr = task.github?.pullRequest;
        if (pr?.merged) {
            toast.success(`PR #${pr.number} is already merged — task marked complete.`, { title: 'GitHub' });
        } else {
            toast.success(`Pull request #${pr?.number} linked.`, { title: 'GitHub' });
        }
        return task;
    }, [activeProjectId, authToken, applyTaskUpdate, toast]);

    const detachPullRequest = useCallback(async (taskId) => {
        const task = await githubService.detachPullRequest(activeProjectId, taskId, authToken);
        applyTaskUpdate(task);
        toast.info('Pull request unlinked.', { title: 'GitHub' });
        return task;
    }, [activeProjectId, authToken, applyTaskUpdate, toast]);

    const attachIssue = useCallback(async (taskId, value) => {
        const task = await githubService.attachIssue(activeProjectId, taskId, value, authToken);
        applyTaskUpdate(task);
        toast.success(`Issue #${task.github?.issue?.number} linked.`, { title: 'GitHub' });
        return task;
    }, [activeProjectId, authToken, applyTaskUpdate, toast]);

    const detachIssue = useCallback(async (taskId) => {
        const task = await githubService.detachIssue(activeProjectId, taskId, authToken);
        applyTaskUpdate(task);
        toast.info('Issue unlinked.', { title: 'GitHub' });
        return task;
    }, [activeProjectId, authToken, applyTaskUpdate, toast]);

    const syncTask = useCallback(async (taskId) => {
        const data = await githubService.syncTask(activeProjectId, taskId, authToken);
        applyTaskUpdate(data.task);
        if (data.autoCompleted) {
            toast.success('Pull request merged — task completed automatically.', { title: 'GitHub' });
        } else if (data.reverted) {
            toast.warning('Pull request reopened — task moved back to In Progress.', { title: 'GitHub' });
        }
        return data.task;
    }, [activeProjectId, authToken, applyTaskUpdate, toast]);

    // -------------------------------------------------------- notifications
    const loadNotifications = useCallback(async () => {
        if (!authToken || isDemoMode) return;
        try {
            const data = await githubService.getNotifications(authToken);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch {
            // A failed notification poll is not worth interrupting anyone over.
        }
    }, [authToken, isDemoMode]);

    useEffect(() => {
        loadNotifications();
        if (!authToken || isDemoMode) return;
        const id = setInterval(loadNotifications, NOTIFICATION_MS);
        return () => clearInterval(id);
    }, [loadNotifications, authToken, isDemoMode]);

    const markAllRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        try { await githubService.markNotificationsRead(authToken); } catch { loadNotifications(); }
    }, [authToken, loadNotifications]);

    const dismissNotification = useCallback(async (id) => {
        setNotifications(prev => prev.filter(n => n._id !== id));
        try { await githubService.deleteNotification(authToken, id); } catch { loadNotifications(); }
    }, [authToken, loadNotifications]);

    const clearNotifications = useCallback(async () => {
        setNotifications([]);
        setUnreadCount(0);
        try { await githubService.clearNotifications(authToken); } catch { loadNotifications(); }
    }, [authToken, loadNotifications]);

    const value = {
        repo,
        activity,
        connected,
        hasToken,
        loading,
        error,
        syncing,
        canManage,
        enabled,

        reload: load,
        connect,
        disconnect,
        syncNow,

        attachPullRequest,
        detachPullRequest,
        attachIssue,
        detachIssue,
        syncTask,

        notifications,
        unreadCount,
        loadNotifications,
        markAllRead,
        dismissNotification,
        clearNotifications,
    };

    return <GithubContext.Provider value={value}>{children}</GithubContext.Provider>;
};

export default GithubContext;
