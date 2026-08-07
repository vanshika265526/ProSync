import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    FiX, FiBell, FiSearch, FiCheckCircle, FiTrash2, FiLoader, FiInbox,
} from 'react-icons/fi';

import { useDashboard } from '../../context/DashboardContext';
import { useNotifications, FILTERS } from '../../context/NotificationContext';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import useHotkey from '../../hooks/useHotkey';
import NotificationCard from './NotificationCard';
import { EmptyState, ErrorState, Skeleton, FilterChip } from '../ui/primitives';

/**
 * Slide-in notification drawer (Feature 2).
 *
 * Right-anchored on desktop, full-width bottom sheet on mobile. Renders
 * through a portal so it always sits above the dashboard's stacking contexts.
 *
 * Focus is trapped while open and returned to the bell on close, which is
 * what makes the whole thing usable from the keyboard.
 */
const NotificationDrawer = () => {
    const { theme } = useDashboard();
    const {
        notifications, unreadCount, loading, error, hasMore,
        filter, setFilter, setSearch, loadMore, refresh,
        markRead, markAllRead, remove, clearAll,
        isOpen, close,
    } = useNotifications();

    const dark = theme === 'dark';
    const panelRef = useRef(null);
    const scrollRef = useRef(null);
    const searchRef = useRef(null);
    const restoreFocusRef = useRef(null);

    // Local input state so typing stays instant; the context only sees the
    // debounced value and therefore only refetches once typing settles.
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebouncedValue(searchInput, 300);
    useEffect(() => { setSearch(debouncedSearch); }, [debouncedSearch, setSearch]);

    const sentinelRef = useInfiniteScroll({ hasMore, loading, onLoadMore: loadMore, rootRef: scrollRef });

    useHotkey('escape', close, { enabled: isOpen, allowInInput: true });

    // --- Focus management ---
    useEffect(() => {
        if (!isOpen) {
            restoreFocusRef.current?.focus?.();
            restoreFocusRef.current = null;
            return undefined;
        }

        restoreFocusRef.current = document.activeElement;
        const timer = setTimeout(() => searchRef.current?.focus(), 220);

        // Simple focus trap: Tab cycles inside the panel only.
        const onKeyDown = (event) => {
            if (event.key !== 'Tab' || !panelRef.current) return;
            const focusable = panelRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    // Lock body scroll behind the drawer.
    useEffect(() => {
        if (!isOpen) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [isOpen]);

    const isEmpty = !loading && notifications.length === 0 && !error;
    const isInitialLoad = loading && notifications.length === 0;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="notification-drawer"
                    className="fixed inset-0 z-[250] flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    <div
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        onClick={close}
                        aria-hidden="true"
                    />

                    <motion.aside
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Notifications"
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
                        {/* Neon hairline */}
                        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-neon-cyan/50 to-transparent" />

                        {/* Header */}
                        <header className={`px-4 pt-4 pb-2.5 border-b shrink-0 ${dark ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-electric-purple/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center text-neon-cyan">
                                        <FiBell size={14} />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className={`text-[13px] font-black tracking-tight truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                                            Notifications
                                        </h2>
                                        <p className="text-[9.5px] text-slate-500 font-medium">
                                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={close}
                                    aria-label="Close notifications"
                                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${dark
                                        ? 'text-slate-500 hover:text-white hover:bg-white/5'
                                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                                        }`}
                                >
                                    <FiX size={15} />
                                </button>
                            </div>

                            {/* Search */}
                            <div className={`flex items-center gap-2 px-2.5 h-8 rounded-lg border mb-2.5 ${dark
                                ? 'bg-white/[0.03] border-white/10 focus-within:border-neon-cyan/40'
                                : 'bg-slate-50 border-slate-200 focus-within:border-neon-cyan/50'
                                } transition-colors`}>
                                <FiSearch size={11} className="text-slate-500 shrink-0" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search notifications..."
                                    aria-label="Search notifications"
                                    className={`flex-1 bg-transparent outline-none text-[11px] font-medium min-w-0 ${dark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'
                                        }`}
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchInput('')}
                                        aria-label="Clear search"
                                        className="text-slate-500 hover:text-slate-300 shrink-0"
                                    >
                                        <FiX size={11} />
                                    </button>
                                )}
                            </div>

                            {/* Filters — compact so all six fit without scrolling */}
                            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5">
                                {FILTERS.map((f) => (
                                    <FilterChip
                                        key={f.id}
                                        layoutId="notification-filter-pill"
                                        active={filter === f.id}
                                        onClick={() => setFilter(f.id)}
                                        dark={dark}
                                        size="sm"
                                        count={f.id === 'unread' ? unreadCount : 0}
                                    >
                                        {f.label}
                                    </FilterChip>
                                ))}
                            </div>
                        </header>

                        {/* Bulk actions */}
                        {notifications.length > 0 && (
                            <div className={`flex items-center justify-between px-4 py-1.5 border-b shrink-0 ${dark ? 'border-white/5' : 'border-slate-100'}`}>
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    disabled={unreadCount === 0}
                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-neon-cyan disabled:opacity-40 disabled:hover:text-slate-500 transition-colors"
                                >
                                    <FiCheckCircle size={11} /> Mark all read
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors"
                                >
                                    <FiTrash2 size={11} /> Clear all
                                </button>
                            </div>
                        )}

                        {/* List */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-2.5">
                            {isInitialLoad && <div className="px-2"><Skeleton lines={5} dark={dark} /></div>}

                            {error && !loading && (
                                <ErrorState message={error} onRetry={refresh} dark={dark} />
                            )}

                            {isEmpty && (
                                <EmptyState
                                    icon={FiInbox}
                                    title={filter === 'unread' ? 'No unread notifications' : 'Nothing here yet'}
                                    description={
                                        searchInput
                                            ? `Nothing matches "${searchInput}".`
                                            : 'Task assignments, deadlines, member activity and GitHub events will show up here.'
                                    }
                                    dark={dark}
                                />
                            )}

                            <div className="space-y-1.5">
                                <AnimatePresence initial={false} mode="popLayout">
                                    {notifications.map((n, i) => (
                                        <NotificationCard
                                            key={n._id}
                                            notification={n}
                                            index={i}
                                            onMarkRead={markRead}
                                            onDelete={remove}
                                            dark={dark}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Infinite scroll sentinel */}
                            {hasMore && (
                                <div ref={sentinelRef} className="flex items-center justify-center py-5">
                                    <FiLoader size={14} className="animate-spin text-slate-600" />
                                </div>
                            )}

                            {!hasMore && notifications.length > 8 && (
                                <p className="text-center text-[10px] text-slate-600 py-5 uppercase tracking-widest font-bold">
                                    That's everything
                                </p>
                            )}
                        </div>
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default NotificationDrawer;
