import React from 'react';
import { motion } from 'framer-motion';
import {
    FiGithub, FiStar, FiEye, FiGitBranch, FiGitCommit, FiRefreshCw,
    FiExternalLink, FiArrowRight,
} from 'react-icons/fi';
import { VscRepoForked, VscIssues, VscGitPullRequest } from 'react-icons/vsc';
import { useDashboard } from '../../context/DashboardContext';
import { useGithub } from '../../context/GithubContext';
import { timeAgo, compact, AnimatedCounter, SyncStatusBadge, Skeleton, EmptyState } from './githubUi';

/**
 * Compact "GitHub Activity" widget for the project dashboard (Feature 2).
 * Self-refreshing via GithubContext's polling.
 */
const GithubWidget = ({ onOpenFull, onConnect }) => {
    const { theme } = useDashboard();
    const { repo, connected, loading, syncing, syncNow, canManage } = useGithub();
    const dark = theme === 'dark';

    const shell = `rounded-3xl border p-6 ${dark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`;

    // ---- Loading ----------------------------------------------------------
    if (loading && !repo) {
        return (
            <div className={shell}>
                <div className="flex items-center gap-3 mb-6">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <Skeleton className="h-3 w-28" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    // ---- Not connected ----------------------------------------------------
    if (!connected || !repo) {
        return (
            <div className={shell}>
                <div className="flex items-center gap-2 mb-5">
                    <FiGithub size={15} className={dark ? 'text-white' : 'text-slate-800'} />
                    <h3 className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>GitHub Activity</h3>
                </div>
                <EmptyState
                    icon={FiGithub}
                    title="Not Connected"
                    description={
                        canManage
                            ? 'Link a repository to track commits, pull requests and issues alongside your tasks.'
                            : 'The project Admin has not linked a GitHub repository yet.'
                    }
                    theme={theme}
                    compactMode
                    action={canManage && onConnect && (
                        <button
                            onClick={onConnect}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-electric-purple text-white text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all"
                        >
                            <FiGithub size={13} /> Connect Repository
                        </button>
                    )}
                />
            </div>
        );
    }

    // ---- Connected --------------------------------------------------------
    const metrics = [
        { icon: FiStar, label: 'Stars', value: repo.stars, tone: 'text-amber-400' },
        { icon: VscRepoForked, label: 'Forks', value: repo.forks, tone: 'text-neon-cyan' },
        { icon: FiEye, label: 'Watchers', value: repo.watchers, tone: 'text-electric-purple' },
        { icon: VscIssues, label: 'Open Issues', value: repo.openIssues, tone: 'text-rose-400' },
        { icon: VscGitPullRequest, label: 'Open PRs', value: repo.openPullRequests, tone: 'text-emerald-400' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${shell} relative overflow-hidden`}
        >
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-neon-cyan/5 blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    <img src={repo.avatar} alt={repo.owner} className="w-9 h-9 rounded-xl border border-white/10 shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-slate-800'}`}>
                                GitHub Activity
                            </h3>
                            <SyncStatusBadge status={repo.syncStatus} showLabel={false} />
                        </div>
                        <a
                            href={repo.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-500 hover:text-neon-cyan transition-colors truncate block"
                        >
                            {repo.fullName}
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={syncNow}
                        disabled={syncing}
                        title="Refresh now"
                        className="p-2 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                        <FiRefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                    </button>
                    <a
                        href={repo.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open on GitHub"
                        className="p-2 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-white/5 transition-all"
                    >
                        <FiExternalLink size={13} />
                    </a>
                </div>
            </div>

            {/* Metrics */}
            <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {metrics.map(m => (
                    <div
                        key={m.label}
                        className={`p-3 rounded-2xl border ${dark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}
                    >
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <m.icon size={11} className={m.tone} />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 truncate">
                                {m.label}
                            </span>
                        </div>
                        <p className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                            <AnimatedCounter value={m.value || 0} />
                        </p>
                    </div>
                ))}
            </div>

            {/* Latest commit + branch */}
            <div className={`relative mt-4 pt-4 border-t ${dark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold">
                        <FiGitBranch size={11} className="text-electric-purple" />
                        <span className={dark ? 'text-slate-300' : 'text-slate-700'}>{repo.defaultBranch}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${repo.isPrivate
                        ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                        : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                        }`}>
                        {repo.isPrivate ? 'Private' : 'Public'}
                    </span>
                    <span className="text-[10px] text-slate-500">Updated {timeAgo(repo.repositoryUpdatedAt)}</span>
                </div>

                {repo.lastCommit?.sha ? (
                    <a
                        href={repo.lastCommit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all group ${dark
                            ? 'bg-slate-950/40 border-white/5 hover:border-neon-cyan/30'
                            : 'bg-slate-50 border-slate-200 hover:border-neon-cyan/30'
                            }`}
                    >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                            <FiGitCommit size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`text-[11px] font-medium truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {repo.lastCommit.message}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                {repo.lastCommit.author} · {timeAgo(repo.lastCommit.date)}
                                {repo.lastCommit.sha && ` · ${repo.lastCommit.sha.slice(0, 7)}`}
                            </p>
                        </div>
                        <FiExternalLink size={12} className="text-slate-600 group-hover:text-neon-cyan transition-colors shrink-0 mt-1" />
                    </a>
                ) : (
                    <p className="text-[11px] text-slate-500 italic">No commits found on {repo.defaultBranch}.</p>
                )}

                {onOpenFull && (
                    <button
                        onClick={onOpenFull}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan text-[10px] font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-midnight transition-all"
                    >
                        View full GitHub dashboard <FiArrowRight size={12} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default GithubWidget;
