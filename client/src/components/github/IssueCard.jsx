import React from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiX, FiClock, FiMessageSquare, FiUser } from 'react-icons/fi';
// react-icons v5's vsc pack has no VscIssueClosed; VscPass is GitHub's
// check-in-circle glyph for a closed issue.
import { VscIssues, VscPass } from 'react-icons/vsc';
import { useDashboard } from '../../context/DashboardContext';
import { timeAgo, formatDateTime, StatePill } from './githubUi';

/** Reads a GitHub label hex colour and picks legible text on top of it. */
const labelStyle = (hex) => {
    const color = (hex || '888888').replace('#', '');
    const r = parseInt(color.slice(0, 2), 16) || 136;
    const g = parseInt(color.slice(2, 4), 16) || 136;
    const b = parseInt(color.slice(4, 6), 16) || 136;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.16)`,
        borderColor: `rgba(${r}, ${g}, ${b}, 0.45)`,
        color: luminance > 0.6 ? `rgb(${r * 0.7}, ${g * 0.7}, ${b * 0.7})` : `rgb(${r}, ${g}, ${b})`,
    };
};

/** Card for a task's linked issue (Feature 4). */
const IssueCard = ({ issue, onDetach, compactMode = false, readOnly = false }) => {
    const { theme } = useDashboard();
    const dark = theme === 'dark';

    if (!issue?.number) return null;

    const closed = issue.state === 'closed';
    const Icon = closed ? VscPass : VscIssues;

    if (compactMode) {
        return (
            <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={`${issue.title} — open on GitHub`}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold transition-all hover:scale-[1.03] ${dark
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:border-neon-cyan/40'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-neon-cyan/40'
                    }`}
            >
                <Icon size={10} className={closed ? 'text-electric-purple' : 'text-emerald-400'} />
                <span>#{issue.number}</span>
                <StatePill state={issue.state} />
            </a>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-5 transition-all ${dark
                ? 'bg-slate-950/40 border-white/5 hover:border-white/10'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${closed ? 'bg-electric-purple/10 text-electric-purple' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                        <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Linked Issue
                            </span>
                            <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                                #{issue.number}
                            </span>
                            <StatePill state={issue.state} />
                        </div>

                        <p className={`text-sm mt-1.5 leading-snug ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {issue.title}
                        </p>

                        {issue.labels?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {issue.labels.map((l, i) => (
                                    <span
                                        key={`${l.name}-${i}`}
                                        style={labelStyle(l.color)}
                                        className="px-2 py-0.5 rounded-md border text-[9px] font-bold"
                                    >
                                        {l.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                            {issue.creatorAvatar && (
                                <span className="inline-flex items-center gap-1.5">
                                    <img src={issue.creatorAvatar} alt={issue.creator} className="w-4 h-4 rounded-md" />
                                    <span className="text-[10px] font-bold text-slate-400">{issue.creator}</span>
                                </span>
                            )}
                            {issue.assignee && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <FiUser size={10} className="text-neon-cyan" /> {issue.assignee}
                                </span>
                            )}
                            {issue.comments > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                    <FiMessageSquare size={10} /> {issue.comments}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-500">
                            <span className="inline-flex items-center gap-1">
                                <FiClock size={10} /> Opened {timeAgo(issue.createdAt)}
                            </span>
                            {closed && issue.closedAt && (
                                <span className="text-electric-purple font-bold" title={formatDateTime(issue.closedAt)}>
                                    Closed {timeAgo(issue.closedAt)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open on GitHub"
                        className="p-2 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-white/5 transition-all"
                    >
                        <FiExternalLink size={14} />
                    </a>
                    {!readOnly && onDetach && (
                        <button
                            onClick={onDetach}
                            title="Unlink issue"
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        >
                            <FiX size={14} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default IssueCard;
