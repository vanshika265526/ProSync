import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDashboard } from './DashboardContext';
import { useRealtime } from './RealtimeContext';
import activityService from '../services/activityService';

/**
 * State for the Live Activity Feed (Feature 4) and the Project History
 * Timeline (Feature 3).
 *
 * They share a provider because they're two views of the same event stream
 * and both need the same socket subscription — splitting them would mean two
 * copies of the paging logic and two chances to drift out of sync.
 *
 * Both reset whenever the active project changes.
 */

const ActivityContext = createContext(null);

export const ACTIVITY_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'task', label: 'Tasks' },
    { id: 'member', label: 'Members' },
    { id: 'github', label: 'GitHub' },
    { id: 'note', label: 'Notes' },
    { id: 'project', label: 'Projects' },
];

const PAGE_SIZE = 25;

const emptyFeed = () => ({ items: [], page: 1, hasMore: false, loading: false, error: null });

export const useActivity = () => useContext(ActivityContext) || {
    activity: emptyFeed(), history: emptyFeed(),
    activityFilter: 'all', setActivityFilter: () => { },
    historyFilter: 'all', setHistoryFilter: () => { },
    historySearch: '', setHistorySearch: () => { },
    loadMoreActivity: () => { }, loadMoreHistory: () => { },
    refreshActivity: () => { }, refreshHistory: () => { },
    isFeedOpen: false, openFeed: () => { }, closeFeed: () => { }, toggleFeed: () => { },
    liveCount: 0,
};

export const ActivityProvider = ({ children }) => {
    const { authToken, isDemoMode, activeProjectId } = useDashboard();
    const { subscribe } = useRealtime();

    const [activity, setActivity] = useState(emptyFeed);
    const [history, setHistory] = useState(emptyFeed);

    const [activityFilter, setActivityFilter] = useState('all');
    const [historyFilter, setHistoryFilter] = useState('all');
    const [historySearch, setHistorySearch] = useState('');

    const [isFeedOpen, setIsFeedOpen] = useState(false);
    // Events that arrived while the panel was shut — drives the "N new" pip.
    const [liveCount, setLiveCount] = useState(0);

    const activityReqRef = useRef(0);
    const historyReqRef = useRef(0);

    const canFetch = !!authToken && !isDemoMode && !!activeProjectId;

    // --- Fetchers ---

    const fetchActivity = useCallback(async (targetPage, { append = false } = {}) => {
        if (!canFetch) return;
        const requestId = ++activityReqRef.current;
        setActivity((s) => ({ ...s, loading: true, error: null }));

        try {
            const data = await activityService.getActivity(activeProjectId, authToken, {
                page: targetPage, limit: PAGE_SIZE, filter: activityFilter,
            });
            if (requestId !== activityReqRef.current) return;

            setActivity((s) => ({
                items: append ? mergeById(s.items, data.items) : data.items,
                page: data.page,
                hasMore: data.hasMore,
                loading: false,
                error: null,
            }));
        } catch (err) {
            if (requestId !== activityReqRef.current) return;
            setActivity((s) => ({
                ...s, loading: false,
                error: err?.response?.data?.message || 'Could not load activity',
            }));
        }
    }, [canFetch, activeProjectId, authToken, activityFilter]);

    const fetchHistory = useCallback(async (targetPage, { append = false } = {}) => {
        if (!canFetch) return;
        const requestId = ++historyReqRef.current;
        setHistory((s) => ({ ...s, loading: true, error: null }));

        try {
            const data = await activityService.getHistory(activeProjectId, authToken, {
                page: targetPage, limit: PAGE_SIZE, filter: historyFilter, search: historySearch,
            });
            if (requestId !== historyReqRef.current) return;

            setHistory((s) => ({
                items: append ? mergeById(s.items, data.items) : data.items,
                page: data.page,
                hasMore: data.hasMore,
                loading: false,
                error: null,
            }));
        } catch (err) {
            if (requestId !== historyReqRef.current) return;
            setHistory((s) => ({
                ...s, loading: false,
                error: err?.response?.data?.message || 'Could not load history',
            }));
        }
    }, [canFetch, activeProjectId, authToken, historyFilter, historySearch]);

    // --- Reset + load on project / filter change ---
    useEffect(() => {
        if (!canFetch) { setActivity(emptyFeed()); return; }
        fetchActivity(1, { append: false });
    }, [canFetch, fetchActivity]);

    useEffect(() => {
        if (!canFetch) { setHistory(emptyFeed()); return; }
        fetchHistory(1, { append: false });
    }, [canFetch, fetchHistory]);

    // --- Realtime ---
    useEffect(() => {
        if (!canFetch) return undefined;

        const unsubActivity = subscribe('activity:new', (doc) => {
            // The socket room is per-project, but a stale room membership after
            // a fast project switch would leak events — check anyway.
            if (String(doc.project) !== String(activeProjectId)) return;
            if (activityFilter !== 'all' && doc.category !== activityFilter) return;

            setActivity((s) => ({
                ...s,
                items: s.items.some((i) => i._id === doc._id) ? s.items : [doc, ...s.items],
            }));
            setLiveCount((c) => (isFeedOpen ? c : c + 1));
        });

        const unsubHistory = subscribe('history:new', (doc) => {
            if (String(doc.project) !== String(activeProjectId)) return;
            if (historyFilter !== 'all' && doc.category !== historyFilter) return;
            if (historySearch) return;

            setHistory((s) => ({
                ...s,
                items: s.items.some((i) => i._id === doc._id) ? s.items : [doc, ...s.items],
            }));
        });

        return () => { unsubActivity(); unsubHistory(); };
    }, [subscribe, canFetch, activeProjectId, activityFilter, historyFilter, historySearch, isFeedOpen]);

    const openFeed = useCallback(() => { setIsFeedOpen(true); setLiveCount(0); }, []);
    const closeFeed = useCallback(() => setIsFeedOpen(false), []);
    const toggleFeed = useCallback(() => {
        setIsFeedOpen((open) => { if (!open) setLiveCount(0); return !open; });
    }, []);

    const value = useMemo(() => ({
        activity, history,
        activityFilter, setActivityFilter,
        historyFilter, setHistoryFilter,
        historySearch, setHistorySearch,
        loadMoreActivity: () => {
            if (!activity.loading && activity.hasMore) fetchActivity(activity.page + 1, { append: true });
        },
        loadMoreHistory: () => {
            if (!history.loading && history.hasMore) fetchHistory(history.page + 1, { append: true });
        },
        refreshActivity: () => fetchActivity(1, { append: false }),
        refreshHistory: () => fetchHistory(1, { append: false }),
        isFeedOpen, openFeed, closeFeed, toggleFeed, liveCount,
    }), [
        activity, history, activityFilter, historyFilter, historySearch,
        fetchActivity, fetchHistory, isFeedOpen, openFeed, closeFeed, toggleFeed, liveCount,
    ]);

    return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

/** Append a page while dropping anything already on screen. */
const mergeById = (existing, incoming) => {
    const seen = new Set(existing.map((i) => i._id));
    return [...existing, ...incoming.filter((i) => !seen.has(i._id))];
};

export default ActivityContext;
