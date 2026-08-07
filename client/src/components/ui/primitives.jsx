import React from 'react';
import { motion } from 'framer-motion';
import {
    FiCheckSquare, FiFolder, FiUsers, FiFileText, FiGithub, FiZap,
    FiActivity, FiMessageSquare, FiInbox,
} from 'react-icons/fi';

/**
 * Shared visual language for the productivity features.
 *
 * Everything here is theme-aware through a `dark` boolean rather than
 * Tailwind's `dark:` variant, because the rest of ProSync drives theming from
 * the DashboardContext value, not from a class on <html> alone. Keeping that
 * consistent matters more than being clever.
 */

// ---------------------------------------------------------------------------
// Category vocabulary — one source of truth for icon + colour
// ---------------------------------------------------------------------------

export const CATEGORY_STYLE = {
    task: { Icon: FiCheckSquare, tone: 'text-neon-cyan', bg: 'bg-neon-cyan/10', ring: 'ring-neon-cyan/30', label: 'Task' },
    project: { Icon: FiFolder, tone: 'text-electric-purple', bg: 'bg-electric-purple/10', ring: 'ring-electric-purple/30', label: 'Project' },
    member: { Icon: FiUsers, tone: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-400/30', label: 'Member' },
    note: { Icon: FiFileText, tone: 'text-sky-400', bg: 'bg-sky-500/10', ring: 'ring-sky-400/30', label: 'Note' },
    github: { Icon: FiGithub, tone: 'text-slate-300', bg: 'bg-slate-500/15', ring: 'ring-slate-400/30', label: 'GitHub' },
    sprint: { Icon: FiZap, tone: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', ring: 'ring-fuchsia-400/30', label: 'Sprint' },
    comment: { Icon: FiMessageSquare, tone: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-400/30', label: 'Comment' },
    system: { Icon: FiActivity, tone: 'text-slate-400', bg: 'bg-slate-500/10', ring: 'ring-slate-400/30', label: 'System' },
};

export const categoryStyle = (category) => CATEGORY_STYLE[category] || CATEGORY_STYLE.system;

export const PRIORITY_BADGE = {
    urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    normal: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    low: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

/** Glassmorphic panel used by the palette, drawer and feed. */
export const GlassPanel = React.forwardRef(({ dark = true, className = '', children, ...rest }, ref) => (
    <div
        ref={ref}
        className={`backdrop-blur-2xl border shadow-2xl ${dark
            ? 'bg-slate-900/85 border-white/10 shadow-black/60'
            : 'bg-white/90 border-slate-200 shadow-slate-300/40'
            } ${className}`}
        {...rest}
    >
        {children}
    </div>
));
GlassPanel.displayName = 'GlassPanel';

// Chips render at two densities: `md` in the roomy History tab, `sm` inside
// the side drawers where six of them have to share ~340px.
const CHIP_SIZE = {
    md: 'px-3 py-1.5 text-[10px] tracking-widest',
    sm: 'px-2.5 py-1 text-[9px] tracking-[0.12em]',
};

/** Small pill used for filters. Animated selection via a shared layoutId. */
export const FilterChip = ({ active, onClick, children, count, dark = true, layoutId, size = 'md' }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`relative rounded-full font-black uppercase
            transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2
            focus-visible:ring-neon-cyan/60 ${CHIP_SIZE[size] || CHIP_SIZE.md} ${active
                ? 'text-midnight'
                : dark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
            }`}
    >
        {active && (
            <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-cyan to-electric-purple shadow-[0_0_16px_rgba(0,242,234,0.35)]"
            />
        )}
        <span className="relative flex items-center gap-1">
            {children}
            {count > 0 && (
                <span className={`text-[8.5px] ${active ? 'text-midnight/70' : 'text-slate-500'}`}>{count}</span>
            )}
        </span>
    </button>
);

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

/** Shimmering placeholder row. `lines` controls how many stack up. */
export const Skeleton = ({ lines = 3, dark = true, className = '' }) => (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl shrink-0 ${dark ? 'bg-white/5' : 'bg-slate-200'} overflow-hidden relative`}>
                    <Shimmer dark={dark} />
                </div>
                <div className="flex-1 space-y-2 pt-1">
                    <div className={`h-2.5 rounded-full w-1/3 relative overflow-hidden ${dark ? 'bg-white/5' : 'bg-slate-200'}`}>
                        <Shimmer dark={dark} />
                    </div>
                    <div className={`h-2.5 rounded-full w-4/5 relative overflow-hidden ${dark ? 'bg-white/5' : 'bg-slate-200'}`}>
                        <Shimmer dark={dark} />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const Shimmer = ({ dark }) => (
    <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
        className={`absolute inset-0 bg-gradient-to-r from-transparent ${dark ? 'via-white/10' : 'via-white/70'} to-transparent`}
    />
);

export const EmptyState = ({ icon: Icon = FiInbox, title, description, dark = true, action }) => (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
        <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative ${dark ? 'bg-white/5 text-slate-600' : 'bg-slate-100 text-slate-400'
                }`}
        >
            <Icon size={24} />
            <div className="absolute -inset-3 bg-neon-cyan/5 blur-2xl rounded-full -z-10" />
        </motion.div>
        <h4 className={`text-sm font-bold mb-1 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{title}</h4>
        {description && (
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-[240px]">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
    </div>
);

export const ErrorState = ({ message, onRetry, dark = true }) => (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6" role="alert">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
            <FiActivity size={20} />
        </div>
        <p className={`text-xs font-bold mb-1 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>Something went wrong</p>
        <p className="text-[11px] text-slate-500 mb-4 max-w-[240px]">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-colors"
            >
                Try again
            </button>
        )}
    </div>
);

// ---------------------------------------------------------------------------
// Bits
// ---------------------------------------------------------------------------

/** Avatar with a graceful initials fallback when the image 404s. */
export const Avatar = ({ src, name = '', size = 32, className = '' }) => {
    const [failed, setFailed] = React.useState(false);
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase() || '?';

    if (!src || failed) {
        return (
            <div
                className={`rounded-xl bg-gradient-to-br from-electric-purple to-neon-cyan text-midnight font-black flex items-center justify-center shrink-0 ${className}`}
                style={{ width: size, height: size, fontSize: size * 0.38 }}
                aria-hidden="true"
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt=""
            onError={() => setFailed(true)}
            className={`rounded-xl object-cover shrink-0 ${className}`}
            style={{ width: size, height: size }}
        />
    );
};

/** Number that rolls when it changes — used for the unread badge. */
export const CountUp = ({ value = 0, className = '' }) => (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
        <motion.span
            key={value}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
            {value}
        </motion.span>
    </span>
);

/** Keyboard key cap. */
export const Kbd = ({ children, dark = true }) => (
    <kbd className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono border ${dark
        ? 'bg-white/5 border-white/10 text-slate-400'
        : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}>
        {children}
    </kbd>
);

/** Unread dot with a soft glow. */
export const UnreadDot = ({ className = '' }) => (
    <span className={`relative flex w-2 h-2 shrink-0 ${className}`}>
        <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-neon-cyan opacity-60" />
        <span className="relative inline-flex rounded-full w-2 h-2 bg-neon-cyan shadow-[0_0_8px_#00F2EA]" />
    </span>
);
