import React from 'react';
import { motion } from 'framer-motion';
import {
    FiExternalLink, FiGitPullRequest, FiX, FiPlus, FiMinus, FiFile, FiClock,
} from 'react-icons/fi';
import { useDashboard } from '../../context/DashboardContext';
import { timeAgo, formatDateTime, StatePill } from './githubUi';

/**
 * Rich card for a task's linked pull request (Feature 3).
 * `compactMode` renders the inline chip used on task cards.
 */
const PullRequestCard = ({ pullRequest: pr, onDetach, compactMode = false, readOnly = false }) => {
    const { theme } = useDashboard();
    const dark = theme === 'dark';

    if (!pr?.number) return null;

    // ---- Inline chip -------------------------------------------------------
    if (compactMode) {
        return (
            <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={`${pr.title} — open on GitHub`}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold transition-all hover:scale-[1.03] ${dark
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:border-neon-cyan/40'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-neon-cyan/40'
                    }`}
            >
                <FiGitPullRequest size={10} className={pr.merged ? 'text-electric-purple' : 'text-emerald-400'} />
                <span>#{pr.number}</span>
                <StatePill state={pr.state} merged={pr.merged} draft={pr.draft} />
            </a>
        );
    }

    // ---- Full card ---------------------------------------------------------
    const diffStats = [
        pr.additions != null && { icon: FiPlus, value: `+${pr.additions}`, tone: 'text-emerald-400' },
        pr.deletions != null && { icon: FiMinus, value: `-${pr.deletions}`, tone: 'text-rose-400' },
        pr.changedFiles != null && { icon: FiFile, value: `${pr.changedFiles} files`, tone: 'text-slate-400' },
    ].filter(Boolean);

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
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${pr.merged
                        ? 'bg-electric-purple/10 text-electric-purple'
                        : pr.state === 'closed'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                        <FiGitPullRequest size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Linked PR
                            </span>
                            <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                                #{pr.number}
                            </span>
                            <StatePill state={pr.state} merged={pr.merged} draft={pr.draft} />
                        </div>

                        <p className={`text-sm mt-1.5 leading-snug ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {pr.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                            {pr.authorAvatar && (
                                <span className="inline-flex items-center gap-1.5">
                                    <img src={pr.authorAvatar} alt={pr.author} className="w-4 h-4 rounded-md" />
                                    <span className="text-[10px] font-bold text-slate-400">{pr.author}</span>
                                </span>
                            )}
                            {pr.branch && (
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${dark ? 'bg-white/5 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                                    {pr.branch} → {pr.baseBranch}
                                </span>
                            )}
                            {diffStats.map((s, i) => (
                                <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-bold ${s.tone}`}>
                                    <s.icon size={10} /> {s.value}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-500">
                            <span className="inline-flex items-center gap-1">
                                <FiClock size={10} /> Opened {timeAgo(pr.createdAt)}
                            </span>
                            {pr.merged && pr.mergedAt && (
                                <span className="text-electric-purple font-bold" title={formatDateTime(pr.mergedAt)}>
                                    Merged {timeAgo(pr.mergedAt)}
                                    {pr.mergedBy ? ` by ${pr.mergedBy}` : ''}
                                </span>
                            )}
                            {!pr.merged && pr.closedAt && (
                                <span className="text-rose-400 font-bold">Closed {timeAgo(pr.closedAt)}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <a
                        href={pr.url}
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
                            title="Unlink pull request"
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

export default PullRequestCard;
