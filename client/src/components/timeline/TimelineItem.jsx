import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { Avatar, categoryStyle } from '../ui/primitives';
import { timeOfDay } from '../../utils/timeFormat';

/**
 * One event on the project history timeline.
 *
 * Renders against a vertical rail: a node marks the moment, the card sits to
 * its right. The rail line is drawn by the item itself (a bordered pseudo
 * column) rather than the parent, so a filtered list never leaves a dangling
 * line past the last entry — `isLast` cuts it.
 *
 * When the event carries a field diff, an old → new chip pair is rendered.
 * That's the whole reason History stores oldValue/newValue separately from
 * the description.
 */
const TimelineItem = ({ entry, isLast = false, dark = true, index = 0 }) => {
    const {
        description, actorName, actorAvatar, createdAt, category,
        field, oldValue, newValue, metadata, entityTitle,
    } = entry;

    const { Icon, tone, bg, ring } = categoryStyle(category);
    const url = metadata?.url;

    const hasDiff =
        field &&
        (oldValue !== undefined && oldValue !== null && oldValue !== '') &&
        (newValue !== undefined && newValue !== null && newValue !== '') &&
        typeof oldValue !== 'object' && typeof newValue !== 'object';

    return (
        <motion.li
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34, delay: Math.min(index * 0.03, 0.25) }}
            className="relative flex gap-4 pb-5 last:pb-0"
        >
            {/* Rail + node */}
            <div className="relative flex flex-col items-center shrink-0">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${bg} ${tone} ${ring} z-10
                    ${dark ? 'shadow-[0_0_14px_rgba(0,0,0,0.5)]' : 'shadow-sm'}`}>
                    <Icon size={14} />
                </span>
                {!isLast && (
                    <span
                        aria-hidden="true"
                        className={`flex-1 w-px mt-1 ${dark ? 'bg-gradient-to-b from-white/10 to-transparent' : 'bg-gradient-to-b from-slate-200 to-transparent'}`}
                    />
                )}
            </div>

            {/* Card */}
            <div className={`flex-1 min-w-0 rounded-2xl border p-3.5 transition-all duration-200 group ${dark
                ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}>
                <div className="flex items-start justify-between gap-3">
                    <p className={`text-[12.5px] font-bold leading-snug ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
                        {description}
                    </p>
                    <time
                        dateTime={createdAt}
                        className="text-[10px] text-slate-500 font-medium shrink-0 tabular-nums pt-0.5"
                    >
                        {timeOfDay(createdAt)}
                    </time>
                </div>

                {hasDiff && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold line-through ${dark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {String(oldValue)}
                        </span>
                        <FiArrowRight size={10} className="text-slate-600" />
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${bg} ${tone}`}>
                            {String(newValue)}
                        </span>
                    </div>
                )}

                {entityTitle && !description.includes(entityTitle) && (
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{entityTitle}</p>
                )}

                <div className="flex items-center gap-2 mt-2.5">
                    <Avatar src={actorAvatar} name={actorName} size={18} className="!rounded-md" />
                    <span className="text-[10.5px] text-slate-500 font-medium">
                        By <span className={dark ? 'text-slate-400' : 'text-slate-600'}>{actorName || 'Someone'}</span>
                    </span>

                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-auto flex items-center gap-1 text-[10px] text-slate-600 hover:text-neon-cyan transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                            Open <FiExternalLink size={9} />
                        </a>
                    )}
                </div>
            </div>
        </motion.li>
    );
};

export default React.memo(TimelineItem);
