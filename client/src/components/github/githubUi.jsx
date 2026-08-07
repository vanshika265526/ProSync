import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FiGitBranch, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

/* ---------------------------------------------------------------------------
 * Shared primitives for the GitHub module: relative time, counters,
 * skeletons, empty states and error states.
 * ------------------------------------------------------------------------ */

/** "10 minutes ago", "2 days ago", "just now". */
export const timeAgo = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 0) return 'just now';
    if (seconds < 45) return 'just now';

    const units = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];

    for (const [name, secs] of units) {
        const amount = Math.floor(seconds / secs);
        if (amount >= 1) return `${amount} ${name}${amount > 1 ? 's' : ''} ago`;
    }
    return 'just now';
};

export const formatDateTime = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
};

/** Compact numbers: 1200 -> 1.2k */
export const compact = (n) => {
    const num = Number(n) || 0;
    if (num < 1000) return String(num);
    if (num < 1_000_000) return `${(num / 1000).toFixed(num < 10_000 ? 1 : 0)}k`;
    return `${(num / 1_000_000).toFixed(1)}m`;
};

/* ------------------------------------------------------------------ counter */

/** Number that animates up to its value when it first appears (Feature 9). */
export const AnimatedCounter = ({ value = 0, duration = 1.1, className = '' }) => {
    const motionValue = useMotionValue(0);
    const rounded = useTransform(motionValue, latest => compact(Math.round(latest)));
    const [display, setDisplay] = React.useState('0');

    React.useEffect(() => {
        const controls = animate(motionValue, Number(value) || 0, {
            duration,
            ease: [0.16, 1, 0.3, 1],
        });
        const unsubscribe = rounded.on('change', setDisplay);
        return () => { controls.stop(); unsubscribe(); };
    }, [value, duration, motionValue, rounded]);

    return <span className={className}>{display}</span>;
};

/* ----------------------------------------------------------------- skeleton */

export const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse rounded-lg bg-white/5 dark:bg-white/5 ${className}`} />
);

export const SkeletonCard = ({ theme = 'dark', lines = 3 }) => (
    <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4 mb-5">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2 w-1/4" />
            </div>
        </div>
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className={`h-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------- empty/error */

export const EmptyState = ({
    icon: Icon = FiGitBranch,
    title,
    description,
    action = null,
    theme = 'dark',
    compactMode = false,
}) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed ${compactMode ? 'py-8 px-6' : 'py-14 px-8'
            } ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}
    >
        <div className={`${compactMode ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-900 text-slate-600' : 'bg-slate-200 text-slate-400'
            }`}>
            <Icon size={compactMode ? 22 : 30} />
        </div>
        <h3 className={`font-bold mb-1 ${compactMode ? 'text-sm' : 'text-lg'} ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            {title}
        </h3>
        {description && <p className="text-slate-500 text-xs max-w-sm leading-relaxed">{description}</p>}
        {action && <div className="mt-5">{action}</div>}
    </motion.div>
);

export const ErrorState = ({ message, onRetry, theme = 'dark', compactMode = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col items-center justify-center text-center rounded-3xl border ${compactMode ? 'py-8 px-6' : 'py-12 px-8'
            } border-rose-500/20 bg-rose-500/[0.04]`}
    >
        <FiAlertCircle size={compactMode ? 22 : 28} className="text-rose-500 mb-3" />
        <h3 className={`font-bold mb-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            Couldn't reach GitHub
        </h3>
        <p className="text-slate-500 text-xs max-w-sm leading-relaxed">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="mt-5 flex items-center gap-2 px-5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all"
            >
                <FiRefreshCw size={12} /> Try again
            </button>
        )}
    </motion.div>
);

/* ------------------------------------------------------------- status chips */

const SYNC_TONES = {
    synced: { dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]', text: 'text-emerald-400', label: 'Synced' },
    pending: { dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse', text: 'text-amber-400', label: 'Pending' },
    failed: { dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]', text: 'text-rose-400', label: 'Failed' },
    not_connected: { dot: 'bg-slate-500', text: 'text-slate-500', label: 'Not Connected' },
};

/** Feature 8 — the 🟢🟡🔴⚪ indicator. */
export const SyncStatusBadge = ({ status = 'not_connected', showLabel = true, title }) => {
    const tone = SYNC_TONES[status] || SYNC_TONES.not_connected;
    return (
        <span
            className={`inline-flex items-center gap-1.5 ${tone.text}`}
            title={title || `GitHub status: ${tone.label}`}
        >
            <span className={`w-2 h-2 rounded-full shrink-0 ${tone.dot}`} />
            {showLabel && (
                <span className="text-[9px] font-black uppercase tracking-widest">{tone.label}</span>
            )}
        </span>
    );
};

/** Coloured pill for PR / issue state. */
export const StatePill = ({ state, merged, draft, className = '' }) => {
    let label = state === 'closed' ? 'Closed' : 'Open';
    let tone = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';

    if (merged) {
        label = 'Merged';
        tone = 'bg-electric-purple/10 border-electric-purple/40 text-electric-purple';
    } else if (draft) {
        label = 'Draft';
        tone = 'bg-slate-500/10 border-slate-500/40 text-slate-400';
    } else if (state === 'closed') {
        tone = 'bg-rose-500/10 border-rose-500/40 text-rose-400';
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${tone} ${className}`}>
            {label}
        </span>
    );
};

/** Small labelled metric used across the widget and insights cards. */
export const StatTile = ({ icon: Icon, label, value, animated = true, accent = 'text-neon-cyan', theme = 'dark' }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className={`p-4 rounded-2xl border transition-all ${theme === 'dark'
            ? 'bg-slate-950/40 border-white/5 hover:border-white/10'
            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
    >
        <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon size={12} className={accent} />}
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        </div>
        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {animated && typeof value === 'number'
                ? <AnimatedCounter value={value} />
                : (value ?? '—')}
        </p>
    </motion.div>
);
