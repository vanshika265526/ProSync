import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBell, FiGithub, FiX, FiCheckCircle, FiAlertCircle, FiAlertTriangle,
    FiInfo, FiExternalLink, FiTrash2,
} from 'react-icons/fi';
import { useDashboard } from '../../context/DashboardContext';
import { useGithub } from '../../context/GithubContext';
import { timeAgo, EmptyState } from './githubUi';

const SEVERITY = {
    success: { Icon: FiCheckCircle, tone: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    error: { Icon: FiAlertCircle, tone: 'text-rose-400', bg: 'bg-rose-500/10' },
    warning: { Icon: FiAlertTriangle, tone: 'text-amber-400', bg: 'bg-amber-500/10' },
    info: { Icon: FiInfo, tone: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
};

/**
 * Bell + dropdown for GitHub notifications (Feature 11).
 * Marks everything read when opened, so the badge reflects genuinely new events.
 */
const GithubNotifications = () => {
    const { theme } = useDashboard();
    const { notifications, unreadCount, markAllRead, dismissNotification, clearNotifications } = useGithub();

    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);
    const dark = theme === 'dark';

    // Close on outside click / Escape.
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const toggle = () => {
        const next = !open;
        setOpen(next);
        if (next && unreadCount > 0) markAllRead();
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={toggle}
                title="GitHub notifications"
                className={`relative p-2.5 rounded-xl border transition-all ${dark
                    ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
            >
                <FiBell size={16} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`absolute right-0 mt-2 w-[min(400px,calc(100vw-2rem))] rounded-2xl border shadow-2xl z-[90] overflow-hidden ${dark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                            }`}
                    >
                        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                                <FiGithub size={14} className={dark ? 'text-white' : 'text-slate-800'} />
                                <h4 className={`text-xs font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
                                    GitHub Notifications
                                </h4>
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearNotifications}
                                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors"
                                >
                                    <FiTrash2 size={10} /> Clear
                                </button>
                            )}
                        </div>

                        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-5">
                                    <EmptyState
                                        icon={FiBell}
                                        title="Nothing yet"
                                        description="Merged pull requests, closed issues and repository changes will show up here."
                                        theme={theme}
                                        compactMode
                                    />
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {notifications.map((n, i) => {
                                        const { Icon, tone, bg } = SEVERITY[n.severity] || SEVERITY.info;
                                        const body = (
                                            <>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bg} ${tone}`}>
                                                    <Icon size={14} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                            {n.title}
                                                        </span>
                                                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />}
                                                    </div>
                                                    <p className={`text-xs font-bold mt-0.5 ${dark ? 'text-white' : 'text-slate-800'}`}>
                                                        {n.message}
                                                    </p>
                                                    {n.detail && (
                                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.detail}</p>
                                                    )}
                                                    <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                                                </div>
                                                {n.url && (
                                                    <FiExternalLink size={12} className="text-slate-600 shrink-0 mt-1" />
                                                )}
                                            </>
                                        );

                                        return (
                                            <motion.div
                                                key={n._id}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 8 }}
                                                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                                                className="relative group"
                                            >
                                                {n.url ? (
                                                    <a
                                                        href={n.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-start gap-3 p-3 rounded-xl transition-all ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                                                    >
                                                        {body}
                                                    </a>
                                                ) : (
                                                    <div className={`flex items-start gap-3 p-3 rounded-xl transition-all ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                                                        {body}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={(e) => { e.preventDefault(); dismissNotification(n._id); }}
                                                    className="absolute top-2 right-2 p-1 rounded text-slate-600 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                                                    aria-label="Dismiss"
                                                >
                                                    <FiX size={12} />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GithubNotifications;
