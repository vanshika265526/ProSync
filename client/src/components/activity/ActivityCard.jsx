import React from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';
import { Avatar, categoryStyle } from '../ui/primitives';
import { timeAgo } from '../../utils/timeFormat';

/**
 * One row in the live activity feed.
 *
 * `isNew` marks entries that arrived over the socket while the panel was
 * open; they get a brief cyan wash so a change appearing mid-scroll is
 * noticeable without being disruptive.
 */
const ActivityCard = ({ entry, dark = true, index = 0, isNew = false }) => {
    const { actorName, actorAvatar, description, createdAt, category, metadata } = entry;
    const { Icon, tone, bg } = categoryStyle(category);
    const url = metadata?.url;

    return (
        <motion.li
            layout
            initial={{ opacity: 0, x: 20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32, delay: Math.min(index * 0.02, 0.18) }}
            className="relative"
        >
            <div className={`relative flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 group overflow-hidden ${dark
                ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}>
                {/* One-shot highlight for freshly-arrived entries */}
                {isNew && (
                    <motion.span
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 2.2, ease: 'easeOut' }}
                        className="absolute inset-0 bg-gradient-to-r from-neon-cyan/15 to-transparent pointer-events-none"
                    />
                )}

                {/* Hover glow */}
                <span className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-r from-neon-cyan/5 via-transparent to-electric-purple/5" />

                <div className="relative shrink-0">
                    <Avatar src={actorAvatar} name={actorName} size={32} />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-md flex items-center justify-center
                        ${bg} ${tone} ring-2 ${dark ? 'ring-slate-950' : 'ring-white'}`}>
                        <Icon size={9} />
                    </span>
                </div>

                <div className="min-w-0 flex-1 relative">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-[11.5px] font-black truncate ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
                            {actorName || 'Someone'}
                        </span>
                        <time dateTime={createdAt} className="text-[9.5px] text-slate-600 font-medium shrink-0">
                            {timeAgo(createdAt)}
                        </time>
                    </div>

                    <p className="text-[11.5px] text-slate-400 leading-snug mt-0.5 break-words">
                        {description}
                    </p>

                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1.5 text-[9.5px] font-bold uppercase tracking-widest text-slate-600 hover:text-neon-cyan transition-colors"
                        >
                            Open <FiExternalLink size={8} />
                        </a>
                    )}
                </div>
            </div>
        </motion.li>
    );
};

export default React.memo(ActivityCard);
