import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { useDashboard } from '../../context/DashboardContext';
import { useNotifications } from '../../context/NotificationContext';
import { useRealtime } from '../../context/RealtimeContext';
import { CountUp } from '../ui/primitives';

/**
 * Bell button + unread badge (Feature 2).
 *
 * The bell physically rings when a notification lands: the icon does a short
 * pendulum swing and a ring pulses outward. It's a one-shot, so a burst of
 * notifications doesn't leave it shaking indefinitely.
 */
const NotificationBell = ({ className = '' }) => {
    const { theme } = useDashboard();
    const { unreadCount, toggle, isOpen } = useNotifications();
    const { connected } = useRealtime();

    const dark = theme === 'dark';
    const [ringing, setRinging] = useState(false);
    const previousCount = useRef(unreadCount);

    useEffect(() => {
        if (unreadCount > previousCount.current) {
            setRinging(true);
            const timer = setTimeout(() => setRinging(false), 900);
            previousCount.current = unreadCount;
            return () => clearTimeout(timer);
        }
        previousCount.current = unreadCount;
        return undefined;
    }, [unreadCount]);

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            aria-expanded={isOpen}
            title="Notifications"
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-xl
                focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${isOpen
                    ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10'
                    : dark
                        ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/50'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/50'
                } ${className}`}
        >
            <motion.span
                animate={ringing ? { rotate: [0, -14, 12, -9, 6, -3, 0] } : { rotate: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="flex"
            >
                <FiBell size={16} />
            </motion.span>

            {/* Pulse ring on arrival */}
            <AnimatePresence>
                {ringing && (
                    <motion.span
                        initial={{ scale: 0.6, opacity: 0.6 }}
                        animate={{ scale: 1.9, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.85, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-xl border border-neon-cyan pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Unread badge */}
            <AnimatePresence>
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                        className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full
                            bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[8.5px] font-black
                            flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.7)] ring-2 ring-slate-950"
                    >
                        {unreadCount > 99 ? '99+' : <CountUp value={unreadCount} />}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Live-connection dot: quiet reassurance that the feed is real-time */}
            <span
                title={connected ? 'Live updates connected' : 'Reconnecting...'}
                className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full transition-colors ${connected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
                    }`}
            />
        </button>
    );
};

export default NotificationBell;
