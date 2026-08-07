import React from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiTrash2, FiCheck } from 'react-icons/fi';
import { Avatar, UnreadDot, categoryStyle, PRIORITY_BADGE } from '../ui/primitives';
import { timeAgo } from '../../utils/timeFormat';

/**
 * A single notification row.
 *
 * Shows the actor's avatar when one exists and the category glyph otherwise —
 * a "PR merged" notification has no human behind it, so a generic avatar
 * would be noise.
 *
 * Presentational by design: it takes callbacks and renders. All state lives
 * in NotificationContext.
 */
const NotificationCard = ({
    notification,
    onMarkRead,
    onDelete,
    onOpen,
    dark = true,
    index = 0,
}) => {
    const {
        _id, title, message, detail, createdAt, read, priority = 'normal',
        actorName, actorAvatar, url, category, source,
    } = notification;

    // Legacy GitHub rows predate `category`; fall back to `source`.
    const resolved = category || (source === 'github' ? 'github' : 'system');
    const { Icon, tone, bg } = categoryStyle(resolved);
    const showPriority = priority === 'high' || priority === 'urgent';

    const handleOpen = () => {
        if (!read) onMarkRead?.(_id);
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        else onOpen?.(notification);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, delay: Math.min(index * 0.025, 0.2) }}
            className="relative group"
        >
            <div
                role="button"
                tabIndex={0}
                onClick={handleOpen}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen(); }
                }}
                aria-label={`${title}. ${message || ''} ${read ? '' : 'Unread'}`}
                className={`flex items-start gap-2.5 p-2.5 pr-14 rounded-xl border cursor-pointer
                    transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60
                    ${read
                        ? dark ? 'border-transparent hover:bg-white/[0.04]' : 'border-transparent hover:bg-slate-50'
                        : dark
                            ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-neon-cyan/25'
                            : 'bg-neon-cyan/[0.04] border-neon-cyan/20 hover:bg-neon-cyan/[0.08]'
                    }`}
            >
                {/* Avatar for human events, category glyph for machine ones */}
                <div className="relative shrink-0">
                    {actorAvatar || actorName ? (
                        <Avatar src={actorAvatar} name={actorName} size={32} />
                    ) : (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${tone}`}>
                            <Icon size={14} />
                        </div>
                    )}
                    {/* Category pip, so the source is readable at a glance */}
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-md flex items-center justify-center
                        ${bg} ${tone} ring-2 ${dark ? 'ring-slate-900' : 'ring-white'}`}>
                        <Icon size={9} />
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                            {title}
                        </span>
                        {!read && <UnreadDot />}
                        {showPriority && (
                            <span className={`px-1.5 py-px rounded text-[8px] font-black uppercase tracking-widest border ${PRIORITY_BADGE[priority]}`}>
                                {priority}
                            </span>
                        )}
                    </div>

                    {message && (
                        <p className={`text-[12.5px] font-bold mt-0.5 leading-snug ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
                            {message}
                        </p>
                    )}
                    {detail && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{detail}</p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-600">{timeAgo(createdAt)}</span>
                        {!read && (
                            <span className="px-1.5 py-px rounded text-[8px] font-black uppercase tracking-widest bg-neon-cyan/15 text-neon-cyan">
                                New
                            </span>
                        )}
                        {url && <FiExternalLink size={10} className="text-slate-600" />}
                    </div>
                </div>
            </div>

            {/* Hover actions — absolutely positioned so they never reflow the card */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                {!read && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onMarkRead?.(_id); }}
                        aria-label="Mark as read"
                        title="Mark as read"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                    >
                        <FiCheck size={12} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete?.(_id); }}
                    aria-label="Delete notification"
                    title="Delete"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                    <FiTrash2 size={12} />
                </button>
            </div>
        </motion.div>
    );
};

export default React.memo(NotificationCard);
