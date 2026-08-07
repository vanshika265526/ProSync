import React from 'react';
import { motion } from 'framer-motion';
import { FiGitCommit, FiExternalLink, FiCheck } from 'react-icons/fi';
import { useDashboard } from '../../context/DashboardContext';
import { timeAgo, formatDateTime, EmptyState, Skeleton } from './githubUi';

/**
 * Vertical commit history (Feature 6).
 * Each entry shows message, author, relative time, short SHA and a GitHub link.
 */
const CommitTimeline = ({ commits = [], loading = false, title = 'Commit History', emptyHint }) => {
    const { theme } = useDashboard();
    const dark = theme === 'dark';

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2 pb-2">
                            <Skeleton className="h-3 w-2/3" />
                            <Skeleton className="h-2 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!commits.length) {
        return (
            <EmptyState
                icon={FiGitCommit}
                title="No commits yet"
                description={emptyHint || 'Commits from the linked branch will appear here as they land.'}
                theme={theme}
                compactMode
            />
        );
    }

    return (
        <div>
            {title && (
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                    {title} <span className="text-slate-600">({commits.length})</span>
                </h4>
            )}

            <div className="relative">
                {/* Spine */}
                <div className={`absolute left-[13px] top-2 bottom-2 w-px ${dark ? 'bg-white/10' : 'bg-slate-200'}`} />

                <div className="space-y-1">
                    {commits.map((commit, i) => (
                        <motion.div
                            key={commit.sha || i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.04, 0.4) }}
                            className="relative flex gap-4 group"
                        >
                            {/* Node */}
                            <div className={`relative z-10 w-[27px] h-[27px] shrink-0 rounded-full flex items-center justify-center border-2 transition-all ${dark
                                ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 group-hover:border-emerald-500'
                                : 'bg-white border-emerald-500/40 text-emerald-500 group-hover:border-emerald-500'
                                }`}>
                                <FiCheck size={12} strokeWidth={3} />
                            </div>

                            <div className={`flex-1 min-w-0 pb-4 rounded-xl px-3 py-2 -mx-1 transition-all ${dark ? 'group-hover:bg-white/[0.03]' : 'group-hover:bg-slate-50'
                                }`}>
                                <div className="flex items-start justify-between gap-3">
                                    <p className={`text-xs font-medium leading-snug break-words ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                                        {commit.message}
                                    </p>
                                    <a
                                        href={commit.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Open on GitHub"
                                        className="shrink-0 p-1 rounded text-slate-600 opacity-0 group-hover:opacity-100 hover:text-neon-cyan transition-all"
                                    >
                                        <FiExternalLink size={12} />
                                    </a>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                    {commit.authorAvatar && (
                                        <img src={commit.authorAvatar} alt={commit.author} className="w-3.5 h-3.5 rounded" />
                                    )}
                                    <span className="text-[10px] font-bold text-slate-400">{commit.author}</span>
                                    <span className="text-[10px] text-slate-500" title={formatDateTime(commit.date)}>
                                        {timeAgo(commit.date)}
                                    </span>
                                    {commit.sha && (
                                        <code className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${dark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>
                                            {commit.sha.slice(0, 7)}
                                        </code>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommitTimeline;
