import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDashboard } from './DashboardContext';
import { useRealtime } from './RealtimeContext';
import notificationService from '../services/notificationService';

/**
 * State for the Notification Center (Feature 2).
 *
 * Owns pagination, filtering, search and unread count. New notifications
 * arrive over the socket and are prepended in place, so the badge and the
 * list stay in sync without a refetch.
 *
 * Every mutation is optimistic and rolls back on failure — marking one
 * notification read shouldn't cost a network round-trip of perceived latency.
 */

const NotificationContext = createContext(null);

export const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'task', label: 'Tasks' },
    { id: 'project', label: 'Projects' },
    { id: 'github', label: 'GitHub' },
    { id: 'member', label: 'Members' },
];

const PAGE_SIZE = 20;

export const useNotifications = () => useContext(NotificationContext) || {
    notifications: [], unreadCount: 0, loading: false, error: null, hasMore: false,
    filter: 'all', setFilter: () => { }, search: '', setSearch: () => { },
    loadMore: () => { }, refresh: () => { }, markRead: () => { }, markAllRead: () => { },
    remove: () => { }, clearAll: () => { }, isOpen: false, open: () => { }, close: () => { }, toggle: () => { },
};

export const NotificationProvider = ({ children }) => {
    const { authToken, isDemoMode } = useDashboard();
    const { subscribe } = useRealtime();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filter, setFilterState] = useState('all');
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Lets a stale in-flight request know it's been superseded, so a slow
    // "All" fetch can't overwrite a fast "Unread" one.
    const requestIdRef = useRef(0);

    const fetchPage = useCallback(async (targetPage, { append = false } = {}) => {
        if (!authToken || isDemoMode) return;

        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError(null);

        try {
            const data = await notificationService.list(authToken, {
                page: targetPage, limit: PAGE_SIZE, filter, search,
            });

            if (requestId !== requestIdRef.current) return;   // superseded

            setNotifications((prev) => {
                if (!append) return data.items;
                // De-dupe: a socket push can race a page fetch.
                const seen = new Set(prev.map((n) => n._id));
                return [...prev, ...data.items.filter((n) => !seen.has(n._id))];
            });
            setUnreadCount(data.unreadCount);
            setHasMore(data.hasMore);
            setPage(data.page);
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            setError(err?.response?.data?.message || 'Could not load notifications');
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [authToken, isDemoMode, filter, search]);

    const refresh = useCallback(() => fetchPage(1, { append: false }), [fetchPage]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        fetchPage(page + 1, { append: true });
    }, [loading, hasMore, page, fetchPage]);

    const setFilter = useCallback((next) => {
        setFilterState(next);
        setPage(1);
    }, []);

    // Refetch whenever the query changes. Debouncing the search box happens
    // in the drawer, so by the time `search` lands here it's already settled.
    useEffect(() => {
        if (!authToken || isDemoMode) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        fetchPage(1, { append: false });
    }, [authToken, isDemoMode, filter, search, fetchPage]);

    // --- Realtime ---
    useEffect(() => {
        if (!authToken || isDemoMode) return undefined;

        return subscribe('notification:new', (notification) => {
            setUnreadCount((c) => c + 1);

            // Only splice it into the visible list if it matches the current
            // filter — otherwise the badge updates and the list stays honest.
            const matchesFilter =
                filter === 'all' ||
                (filter === 'unread' && !notification.read) ||
                notification.category === filter ||
                (filter === 'github' && notification.source === 'github');

            if (!matchesFilter) return;
            if (search) return;   // don't inject into a filtered search result

            setNotifications((prev) =>
                prev.some((n) => n._id === notification._id) ? prev : [notification, ...prev]
            );
        });
    }, [subscribe, authToken, isDemoMode, filter, search]);

    // Cheap safety net: if sockets are unavailable, keep the badge roughly
    // current. 60s is slow enough to be free and fast enough to feel alive.
    useEffect(() => {
        if (!authToken || isDemoMode) return undefined;
        const timer = setInterval(async () => {
            try {
                setUnreadCount(await notificationService.count(authToken));
            } catch { /* offline — the next tick will retry */ }
        }, 60_000);
        return () => clearInterval(timer);
    }, [authToken, isDemoMode]);

    // --- Mutations (optimistic) ---

    const markRead = useCallback(async (ids) => {
        const list = Array.isArray(ids) ? ids : [ids];
        const previous = notifications;
        const previousCount = unreadCount;

        setNotifications((prev) =>
            prev.map((n) => (list.includes(n._id) ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - previous.filter((n) => list.includes(n._id) && !n.read).length));

        try {
            const data = await notificationService.markRead(authToken, list);
            setUnreadCount(data.unreadCount);
        } catch {
            setNotifications(previous);
            setUnreadCount(previousCount);
        }
    }, [authToken, notifications, unreadCount]);

    const markAllRead = useCallback(async () => {
        const previous = notifications;
        const previousCount = unreadCount;

        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);

        try {
            await notificationService.markRead(authToken);
            // The unread tab is now empty by definition — reflect that.
            if (filter === 'unread') fetchPage(1, { append: false });
        } catch {
            setNotifications(previous);
            setUnreadCount(previousCount);
        }
    }, [authToken, notifications, unreadCount, filter, fetchPage]);

    const remove = useCallback(async (id) => {
        const previous = notifications;
        const previousCount = unreadCount;
        const target = previous.find((n) => n._id === id);

        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (target && !target.read) setUnreadCount((c) => Math.max(0, c - 1));

        try {
            const data = await notificationService.remove(id, authToken);
            setUnreadCount(data.unreadCount);
        } catch {
            setNotifications(previous);
            setUnreadCount(previousCount);
        }
    }, [authToken, notifications, unreadCount]);

    const clearAll = useCallback(async () => {
        const previous = notifications;
        const previousCount = unreadCount;

        setNotifications([]);
        setUnreadCount(0);
        setHasMore(false);

        try {
            await notificationService.clearAll(authToken);
        } catch {
            setNotifications(previous);
            setUnreadCount(previousCount);
        }
    }, [authToken, notifications, unreadCount]);

    const value = useMemo(() => ({
        notifications, unreadCount, loading, error, hasMore,
        filter, setFilter, search, setSearch,
        loadMore, refresh, markRead, markAllRead, remove, clearAll,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
    }), [
        notifications, unreadCount, loading, error, hasMore, filter, setFilter,
        search, loadMore, refresh, markRead, markAllRead, remove, clearAll, isOpen,
    ]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;
