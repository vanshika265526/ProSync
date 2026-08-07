import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiActivity } from 'react-icons/fi';
import { useDashboard } from '../../context/DashboardContext';
import { useActivity } from '../../context/ActivityContext';
import { CountUp } from '../ui/primitives';

/**
 * Header toggle for the Activity Feed panel.
 * Carries a badge counting events that arrived while the panel was closed.
 */
const ActivityFeedButton = ({ className = '' }) => {
    const { theme } = useDashboard();
    const { toggleFeed, isFeedOpen, liveCount } = useActivity();
    const dark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleFeed}
            aria-label={liveCount > 0 ? `Activity feed, ${liveCount} new events` : 'Activity feed'}
            aria-expanded={isFeedOpen}
            title="Activity feed"
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-xl
                focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-purple/60 ${isFeedOpen
                    ? 'border-electric-purple/50 text-electric-purple bg-electric-purple/10'
                    : dark
                        ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-electric-purple hover:border-electric-purple/50'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-electric-purple hover:border-electric-purple/50'
                } ${className}`}
        >
            <FiActivity size={16} />

            <AnimatePresence>
                {liveCount > 0 && !isFeedOpen && (
                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                        className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full
                            bg-gradient-to-br from-electric-purple to-fuchsia-600 text-white text-[8.5px] font-black
                            flex items-center justify-center shadow-[0_0_12px_rgba(125,0,255,0.7)] ring-2 ring-slate-950"
                    >
                        {liveCount > 99 ? '99+' : <CountUp value={liveCount} />}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
};

export default ActivityFeedButton;
