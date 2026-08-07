import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FiGithub, FiActivity, FiGitCommit, FiUsers, FiClock, FiKey, FiAlertTriangle,
} from 'react-icons/fi';
import { VscGitPullRequest, VscGitMerge, VscIssues } from 'react-icons/vsc';
import { useDashboard } from '../../context/DashboardContext';
import { useGithub } from '../../context/GithubContext';
import githubService, { githubErrorMessage } from '../../services/githubService';
import GithubModal from './GithubModal';
import RepositoryCard from './RepositoryCard';
import CommitTimeline from './CommitTimeline';
import ActivityTimeline from './ActivityTimeline';
import { StatTile, EmptyState, ErrorState, SkeletonCard, timeAgo } from './githubUi';

/**
 * The full "GitHub" tab for a project.
 * Combines connection state, repository insights (Feature 9), the activity
 * feed (Feature 7) and the default-branch commit timeline (Feature 6).
 */
const GithubDashboard = () => {
    const { theme, activeProjectId, authToken, isDemoMode } = useDashboard();
    const {
        repo, activity, connected, loading, error, canManage, hasToken,
        reload, disconnect,
    } = useGithub();

    const [modalOpen, setModalOpen] = useState(false);
    const [commits, setCommits] = useState([]);
    const [commitsLoading, setCommitsLoading] = useState(false);
    const [commitsError, setCommitsError] = useState('');

    const dark = theme === 'dark';
    const card = `rounded-3xl border p-6 ${dark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`;

    const loadCommits = useCallback(async () => {
        if (!connected || !activeProjectId || !authToken) return;
        setCommitsLoading(true);
        setCommitsError('');
        try {
            setCommits(await githubService.getCommits(activeProjectId, authToken, { limit: 20 }));
        } catch (err) {
            setCommitsError(githubErrorMessage(err));
        } finally {
            setCommitsLoading(false);
        }
    }, [connected, activeProjectId, authToken]);

    useEffect(() => { loadCommits(); }, [loadCommits, repo?.lastCommit?.sha]);

    // ---- Demo mode --------------------------------------------------------
    if (isDemoMode) {
        return (
            <div className="animate-in fade-in duration-500">
                <EmptyState
                    icon={FiGithub}
                    title="GitHub isn't available in demo mode"
                    description="Sign in with a real account to connect a repository and link pull requests to your tasks."
                    theme={theme}
                />
            </div>
        );
    }

    // ---- Loading ----------------------------------------------------------
    if (loading && !repo) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <SkeletonCard theme={theme} lines={4} />
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`${card} h-24 animate-pulse`} />
                    ))}
                </div>
            </div>
        );
    }

    // ---- Error ------------------------------------------------------------
    if (error && !repo) {
        return (
            <div className="animate-in fade-in duration-500">
                <ErrorState message={error} onRetry={() => reload({ refresh: true })} theme={theme} />
            </div>
        );
    }

    // ---- Not connected ----------------------------------------------------
    if (!connected || !repo) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>GitHub Integration</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Link a repository to track pull requests, issues and commits alongside your tasks.
                    </p>
                </div>

                <div className={card}>
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Repository</span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Not Connected</span>
                        </span>
                    </div>

                    <EmptyState
                        icon={FiGithub}
                        title="No repository connected"
                        description={
                            canManage
                                ? 'Paste a GitHub URL or owner/repository to get started. Public repositories work out of the box.'
                                : 'Only the project Admin can connect a repository to this project.'
                        }
                        theme={theme}
                        action={canManage && (
                            <button
                                onClick={() => setModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-electric-purple text-white text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all"
                            >
                                <FiGithub size={14} /> Connect Repository
                            </button>
                        )}
                    />
                </div>

                <GithubModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
            </div>
        );
    }

    // ---- Connected --------------------------------------------------------
    const insights = [
        { icon: FiGitCommit, label: 'Total Commits', value: repo.totalCommits, accent: 'text-neon-cyan' },
        { icon: VscGitPullRequest, label: 'Open PR', value: repo.openPullRequests, accent: 'text-emerald-400' },
        { icon: VscGitMerge, label: 'Closed PR', value: repo.closedPullRequests, accent: 'text-electric-purple' },
        { icon: VscIssues, label: 'Open Issues', value: repo.openIssues, accent: 'text-rose-400' },
        { icon: FiUsers, label: 'Contributors', value: repo.contributors, accent: 'text-amber-400' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>GitHub Integration</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Connected to <span className="text-neon-cyan font-bold">{repo.fullName}</span>
                    </p>
                </div>
            </div>

            {/* Rate-limit warning when no PAT is configured */}
            {!hasToken && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30"
                >
                    <FiKey size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-amber-300">No GitHub token configured</p>
                        <p className="text-[11px] text-amber-200/70 mt-1 leading-relaxed">
                            Requests are capped at 60 per hour. Add <code className="font-mono">GITHUB_TOKEN</code> to
                            {' '}<code className="font-mono">server/.env</code> to raise this to 5,000 and keep auto-sync reliable.
                        </p>
                    </div>
                </motion.div>
            )}

            <RepositoryCard onDisconnect={disconnect} />

            {/* Insights (Feature 9) */}
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                    Repository Insights
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {insights.map(i => (
                        <StatTile key={i.label} {...i} theme={theme} />
                    ))}
                    <StatTile
                        icon={FiClock}
                        label="Last Commit"
                        value={repo.lastCommit?.date ? timeAgo(repo.lastCommit.date) : '—'}
                        animated={false}
                        accent="text-slate-400"
                        theme={theme}
                    />
                </div>
            </div>

            {/* Activity + commits */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={card}>
                    <div className="flex items-center gap-2 mb-5">
                        <FiActivity size={14} className="text-neon-cyan" />
                        <h3 className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>Recent Activity</h3>
                    </div>
                    <div className="max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                        <ActivityTimeline activity={activity} />
                    </div>
                </div>

                <div className={card}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <FiGitCommit size={14} className="text-emerald-400" />
                            <h3 className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
                                Commits on {repo.defaultBranch}
                            </h3>
                        </div>
                    </div>

                    <div className="max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                        {commitsError ? (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <FiAlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-rose-300 leading-relaxed">{commitsError}</p>
                            </div>
                        ) : (
                            <CommitTimeline
                                commits={commits}
                                loading={commitsLoading}
                                title={null}
                                emptyHint={`No commits on ${repo.defaultBranch} yet. Push your first commit and it will show up here.`}
                            />
                        )}
                    </div>
                </div>
            </div>

            <GithubModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
};

export default GithubDashboard;
