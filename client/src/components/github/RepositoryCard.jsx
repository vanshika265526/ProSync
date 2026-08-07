import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiGithub, FiStar, FiGitBranch, FiExternalLink, FiRefreshCw, FiTrash2,
    FiAlertCircle, FiCheckCircle, FiCode,
} from 'react-icons/fi';
import { VscRepoForked, VscIssues } from 'react-icons/vsc';
import { useDashboard } from '../../context/DashboardContext';
import { useGithub } from '../../context/GithubContext';
import { timeAgo, compact, SyncStatusBadge } from './githubUi';

/**
 * The "connected repository" hero card (Feature 1).
 * Shows identity, headline counters, sync state, and Admin-only controls.
 */
const RepositoryCard = ({ onDisconnect }) => {
    const { theme } = useDashboard();
    const { repo, syncNow, syncing, canManage } = useGithub();
    const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

    const dark = theme === 'dark';
    if (!repo) return null;

    const stats = [
        { icon: FiStar, label: 'Stars', value: compact(repo.stars), tone: 'text-amber-400' },
        { icon: VscRepoForked, label: 'Forks', value: compact(repo.forks), tone: 'text-neon-cyan' },
        { icon: VscIssues, label: 'Open Issues', value: compact(repo.openIssues), tone: 'text-rose-400' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${dark
                ? 'bg-slate-900/50 border-white/5'
                : 'bg-white border-slate-200 shadow-sm'
                }`}
        >
            {/* Ambient glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-electric-purple/10 blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Identity */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0">
                        <img
                            src={repo.avatar}
                            alt={repo.owner}
                            className="w-16 h-16 rounded-2xl border-2 border-white/10 object-cover"
                        />
                        <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center border-2 ${dark ? 'bg-slate-900 border-slate-900' : 'bg-white border-white'
                            }`}>
                            <FiGithub size={13} className={dark ? 'text-white' : 'text-slate-800'} />
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-xl font-bold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                                {repo.repositoryName}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${repo.isPrivate
                                ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                                : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                                }`}>
                                {repo.isPrivate ? 'Private' : 'Public'} Repository
                            </span>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{repo.fullName}</p>

                        {repo.description && (
                            <p className={`text-xs mt-2.5 leading-relaxed line-clamp-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {repo.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
                            {stats.map(s => (
                                <span key={s.label} className="inline-flex items-center gap-1.5 text-xs font-bold">
                                    <s.icon size={13} className={s.tone} />
                                    <span className={dark ? 'text-white' : 'text-slate-800'}>{s.value}</span>
                                    <span className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">{s.label}</span>
                                </span>
                            ))}
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                                <FiGitBranch size={13} className="text-electric-purple" />
                                <span className={dark ? 'text-white' : 'text-slate-800'}>{repo.defaultBranch}</span>
                            </span>
                            {repo.language && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                                    <FiCode size={13} className="text-neon-cyan" />
                                    <span className={dark ? 'text-white' : 'text-slate-800'}>{repo.language}</span>
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                <FiCheckCircle size={12} /> Connected Successfully
                            </span>
                            <SyncStatusBadge status={repo.syncStatus} />
                            <span className="text-[10px] text-slate-500 font-medium">
                                Updated {timeAgo(repo.repositoryUpdatedAt)}
                            </span>
                            {repo.lastSyncedAt && (
                                <span className="text-[10px] text-slate-600 font-medium">
                                    Synced {timeAgo(repo.lastSyncedAt)}
                                </span>
                            )}
                        </div>

                        {repo.syncStatus === 'failed' && repo.syncError && (
                            <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <FiAlertCircle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-rose-300 leading-relaxed">{repo.syncError}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 shrink-0">
                    <a
                        href={repo.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${dark
                            ? 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <FiExternalLink size={12} /> Open
                    </a>

                    <button
                        onClick={syncNow}
                        disabled={syncing}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-[10px] font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-midnight transition-all disabled:opacity-50"
                    >
                        <FiRefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing' : 'Sync'}
                    </button>

                    {canManage && (
                        confirmingDisconnect ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setConfirmingDisconnect(false);
                                        // GithubContext.disconnect toasts its own failures.
                                        Promise.resolve(onDisconnect?.()).catch(() => { });
                                    }}
                                    className="flex-1 px-3 py-2.5 rounded-xl bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setConfirmingDisconnect(false)}
                                    className="px-3 py-2.5 rounded-xl border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all"
                                >
                                    No
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmingDisconnect(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            >
                                <FiTrash2 size={12} /> Disconnect
                            </button>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default RepositoryCard;
