import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiActivity, FiLoader, FiRefreshCw, FiWifi, FiWifiOff } from 'react-icons/fi';

import { useDashboard } from '../../context/DashboardContext';
import { useActivity, ACTIVITY_FILTERS } from '../../context/ActivityContext';
import { useRealtime } from '../../context/RealtimeContext';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import useHotkey from '../../hooks/useHotkey';
import { groupByDay } from '../../utils/timeFormat';
import ActivityCard from './ActivityCard';
import { EmptyState, ErrorState, Skeleton, FilterChip } from '../ui/primitives';

/**
 * Live Activity Feed (Feature 4) — a toggleable right-hand panel.
 *
 * Slides in over the dashboard rather than resizing it, so opening the feed
 * never reflows the Kanban board mid-drag. On mobile it becomes a full-width
 * sheet.
 *
 * Entries pushed over the socket are tracked in `freshIds` so they can be
 * highlighted once and then settle into the list.
 */
const ActivityFeed = () => {
    const { theme, projects, activeProjectId } = useDashboard();
    const {
        activity, activityFilter, setActivityFilter,
        loadMoreActivity, refreshActivity, isFeedOpen, closeFeed,
    } = useActivity();
    const { connected } = useRealtime();

    const dark = theme === 'dark';
    const scrollRef = useRef(null);
    const panelRef = useRef(null);
    const restoreFocusRef = useRef(null);

    const [freshIds, setFreshIds] = useState(() => new Set());
    const knownIdsRef = useRef(new Set());

    const activeProject = useMemo(
        () => projects.find((p) => p._id === activeProjectId),
        [projects, activeProjectId]
    );

    // Anything we haven't seen before *after* the first page counts as fresh.
    useEffect(() => {
        const ids = activity.items.map((i) => i._id);
        if (knownIdsRef.current.size === 0) {
            knownIdsRef.current = new Set(ids);
            return;
        }

        const arrived = ids.filter((id) => !knownIdsRef.current.has(id));
        if (arrived.length === 0) return;

        arrived.forEach((id) => knownIdsRef.current.add(id));
        setFreshIds((prev) => new Set([...prev, ...arrived]));

        // Let the highlight fade, then stop tracking them.
        const timer = setTimeout(() => {
            setFreshIds((prev) => {
                const next = new Set(prev);
                arrived.forEach((id) => next.delete(id));
                return next;
            });
        }, 2600);

        return () => clearTimeout(timer);
    }, [activity.items]);

    // A project switch invalidates everything we thought we knew.
    useEffect(() => {
        knownIdsRef.current = new Set();
        setFreshIds(new Set());
    }, [activeProjectId]);

    const sentinelRef = useInfiniteScroll({
        hasMore: activity.hasMore,
        loading: activity.loading,
        onLoadMore: loadMoreActivity,
        rootRef: scrollRef,
    });

    useHotkey('escape', closeFeed, { enabled: isFeedOpen, allowInInput: true });

    useEffect(() => {
        if (!isFeedOpen) {
            restoreFocusRef.current?.focus?.();
            restoreFocusRef.current = null;
            return;
        }
        restoreFocusRef.current = document.activeElement;
    }, [isFeedOpen]);

    const groups = useMemo(() => groupByDay(activity.items), [activity.items]);
    const isInitialLoad = activity.loading && activity.items.length === 0;
    const isEmpty = !activity.loading && activity.items.length === 0 && !activity.error;

    return createPortal(
        <AnimatePresence>
            {isFeedOpen && (
                <motion.div
                    key="activity-feed"
                    className="fixed inset-0 z-[240] flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    <div
                        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                        onClick={closeFeed}
                        aria-hidden="true"
                    />

                    <motion.aside
                        ref={panelRef}
                        role="complementary"
                        aria-label="Live activity feed"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                        className={`relative h-full w-full sm:w-[344px] flex flex-col border-l backdrop-blur-2xl
                            shadow-[-20px_0_60px_-12px_rgba(0,0,0,0.6)] ${dark
                                ? 'bg-slate-900/95 border-white/10'
                                : 'bg-white/97 border-slate-200'
                            }`}
                    >
                        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-electric-purple/50 to-transparent" />

                        {/* Header */}
                        <header className={`px-4 pt-4 pb-2.5 border-b shrink-0 ${dark ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-electric-purple/20 border border-white/10 flex items-center justify-center text-neon-cyan shrink-0">
                                        <FiActivity size={14} />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className={`text-[13px] font-black tracking-tight truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                                            Activity Feed
                                        </h2>
                                        <p className="text-[9.5px] text-slate-500 font-medium truncate">
                                            {activeProject?.name || 'Project'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={refreshActivity}
                                        aria-label="Refresh feed"
                                        title="Refresh"
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-white/5 transition-colors"
                                    >
                                        <FiRefreshCw size={12} className={activity.loading ? 'animate-spin' : ''} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeFeed}
                                        aria-label="Close activity feed"
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <FiX size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Connection state — the feed's honesty indicator */}
                            <div className="flex items-center gap-1.5 mb-3">
                                {connected ? (
                                    <>
                                        <span className="relative flex w-1.5 h-1.5">
                                            <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-70" />
                                            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-400" />
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Live</span>
                                        <FiWifi size={9} className="text-emerald-400/60" />
                                    </>
                                ) : (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Offline</span>
                                        <FiWifiOff size={9} className="text-slate-600" />
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5">
                                {ACTIVITY_FILTERS.map((f) => (
                                    <FilterChip
                                        key={f.id}
                                        layoutId="activity-filter-pill"
                                        active={activityFilter === f.id}
                                        onClick={() => setActivityFilter(f.id)}
                                        dark={dark}
                                        size="sm"
                                    >
                                        {f.label}
                                    </FilterChip>
                                ))}
                            </div>
                        </header>

                        {/* Feed */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3">
                            {isInitialLoad && <Skeleton lines={6} dark={dark} />}

                            {activity.error && !activity.loading && (
                                <ErrorState message={activity.error} onRetry={refreshActivity} dark={dark} />
                            )}

                            {isEmpty && (
                                <EmptyState
                                    icon={FiActivity}
                                    title="Nothing happening yet"
                                    description="Task changes, member activity and GitHub events from your team will stream in here in real time."
                                    dark={dark}
                                />
                            )}

                            {groups.map((group) => (
                                <section key={group.label} className="mb-4 last:mb-0">
                                    <div className={`sticky top-0 z-10 -mx-1 px-1 py-1.5 mb-2 backdrop-blur-xl ${dark ? 'bg-slate-900/80' : 'bg-white/85'
                                        }`}>
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                                            {group.label}
                                        </h3>
                                    </div>

                                    <ul className="space-y-2">
                                        <AnimatePresence initial={false} mode="popLayout">
                                            {group.items.map((entry, i) => (
                                                <ActivityCard
                                                    key={entry._id}
                                                    entry={entry}
                                                    index={i}
                                                    dark={dark}
                                                    isNew={freshIds.has(entry._id)}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </ul>
                                </section>
                            ))}

                            {activity.hasMore && (
                                <div ref={sentinelRef} className="flex items-center justify-center py-5">
                                    <FiLoader size={14} className="animate-spin text-slate-600" />
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ActivityFeed;
