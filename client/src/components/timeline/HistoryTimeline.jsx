import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiX, FiClock, FiLoader, FiRefreshCw } from 'react-icons/fi';

import { useDashboard } from '../../context/DashboardContext';
import { useActivity, ACTIVITY_FILTERS } from '../../context/ActivityContext';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { groupByDay } from '../../utils/timeFormat';
import TimelineItem from './TimelineItem';
import { EmptyState, ErrorState, Skeleton, FilterChip } from '../ui/primitives';

/**
 * Project History tab (Feature 3).
 *
 * A chronological audit log grouped into Today / Yesterday / Last Week /
 * Last Month / Earlier. Grouping happens client-side on the already-sorted
 * page — the server's job is ordering and paging, not presentation.
 *
 * Group headings are sticky so you always know where you are while scrolling
 * a long history.
 */
const HistoryTimeline = () => {
    const { theme } = useDashboard();
    const {
        history, historyFilter, setHistoryFilter, setHistorySearch,
        loadMoreHistory, refreshHistory,
    } = useActivity();

    const dark = theme === 'dark';
    const scrollRef = useRef(null);

    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebouncedValue(searchInput, 300);
    useEffect(() => { setHistorySearch(debouncedSearch); }, [debouncedSearch, setHistorySearch]);

    const sentinelRef = useInfiniteScroll({
        hasMore: history.hasMore,
        loading: history.loading,
        onLoadMore: loadMoreHistory,
        rootRef: scrollRef,
    });

    const groups = useMemo(() => groupByDay(history.items), [history.items]);

    const isInitialLoad = history.loading && history.items.length === 0;
    const isEmpty = !history.loading && history.items.length === 0 && !history.error;

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 shrink-0">
                <div className={`flex items-center gap-2.5 px-3 h-9 rounded-xl border flex-1 min-w-0 transition-colors ${dark
                    ? 'bg-white/[0.03] border-white/10 focus-within:border-neon-cyan/40'
                    : 'bg-white border-slate-200 focus-within:border-neon-cyan/50'
                    }`}>
                    <FiSearch size={13} className="text-slate-500 shrink-0" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search the timeline..."
                        aria-label="Search project history"
                        className={`flex-1 bg-transparent outline-none text-xs font-medium min-w-0 ${dark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'
                            }`}
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => setSearchInput('')}
                            aria-label="Clear search"
                            className="text-slate-500 hover:text-slate-300 shrink-0"
                        >
                            <FiX size={12} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {ACTIVITY_FILTERS.map((f) => (
                        <FilterChip
                            key={f.id}
                            layoutId="history-filter-pill"
                            active={historyFilter === f.id}
                            onClick={() => setHistoryFilter(f.id)}
                            dark={dark}
                        >
                            {f.label}
                        </FilterChip>
                    ))}

                    <button
                        type="button"
                        onClick={refreshHistory}
                        aria-label="Refresh timeline"
                        title="Refresh"
                        className={`ml-1 p-2 rounded-xl border transition-colors shrink-0 ${dark
                            ? 'border-white/10 text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/40'
                            : 'border-slate-200 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40'
                            }`}
                    >
                        <FiRefreshCw size={12} className={history.loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar -mr-3 pr-3">
                {isInitialLoad && <Skeleton lines={6} dark={dark} />}

                {history.error && !history.loading && (
                    <ErrorState message={history.error} onRetry={refreshHistory} dark={dark} />
                )}

                {isEmpty && (
                    <EmptyState
                        icon={FiClock}
                        title="No history yet"
                        description={
                            searchInput
                                ? `Nothing in the timeline matches "${searchInput}".`
                                : 'Every change to this project — tasks, members, notes and repository events — will be recorded here.'
                        }
                        dark={dark}
                    />
                )}

                <AnimatePresence initial={false}>
                    {groups.map((group, groupIndex) => (
                        <motion.section
                            key={group.label}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="mb-2"
                        >
                            {/* Sticky group heading */}
                            <div className={`sticky top-0 z-20 -mx-1 px-1 py-2 backdrop-blur-xl ${dark ? 'bg-slate-950/70' : 'bg-slate-50/85'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.22em] text-neon-cyan">
                                        {group.label}
                                    </h3>
                                    <span className={`flex-1 h-px ${dark ? 'bg-white/5' : 'bg-slate-200'}`} />
                                    <span className="text-[9px] font-bold text-slate-600 tabular-nums">
                                        {group.items.length}
                                    </span>
                                </div>
                            </div>

                            <ul className="pt-3">
                                {group.items.map((entry, i) => (
                                    <TimelineItem
                                        key={entry._id}
                                        entry={entry}
                                        index={i}
                                        dark={dark}
                                        // Only the very last item of the very last
                                        // group ends the rail.
                                        isLast={
                                            i === group.items.length - 1 &&
                                            groupIndex === groups.length - 1 &&
                                            !history.hasMore
                                        }
                                    />
                                ))}
                            </ul>
                        </motion.section>
                    ))}
                </AnimatePresence>

                {history.hasMore && (
                    <div ref={sentinelRef} className="flex items-center justify-center py-6">
                        <FiLoader size={15} className="animate-spin text-slate-600" />
                    </div>
                )}

                {!history.hasMore && history.items.length > 10 && (
                    <p className="text-center text-[10px] text-slate-600 py-6 uppercase tracking-widest font-bold">
                        Beginning of history
                    </p>
                )}
            </div>
        </div>
    );
};

export default HistoryTimeline;
