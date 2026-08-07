import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGithub, FiPlus, FiLoader, FiCheckCircle, FiAlertCircle, FiRefreshCw,
    FiZap, FiActivity, FiClock,
} from 'react-icons/fi';
import { VscGitPullRequest, VscIssues } from 'react-icons/vsc';
import { useDashboard } from '../../context/DashboardContext';
import { useGithub } from '../../context/GithubContext';
import { githubErrorMessage } from '../../services/githubService';
import PullRequestCard from './PullRequestCard';
import IssueCard from './IssueCard';
import CommitTimeline from './CommitTimeline';
import { SyncStatusBadge, timeAgo, formatDateTime, EmptyState } from './githubUi';

const ACTIVITY_LABELS = {
    pr_linked: 'PR Linked',
    pr_created: 'PR Created',
    pr_merged: 'PR Merged',
    pr_reopened: 'PR Reopened',
    issue_linked: 'Issue Linked',
    issue_closed: 'Issue Closed',
    issue_reopened: 'Issue Reopened',
    commit_added: 'Commit Added',
    comment_added: 'Comment Added',
};

/**
 * The GitHub section inside a task (Features 3, 4, 5, 6, 8, 10).
 * Rendered by TaskModal for saved tasks only — a task needs an id before it
 * can be linked to anything.
 */
const TaskGithubPanel = ({ task }) => {
    const { theme, tasks } = useDashboard();
    const {
        connected, attachPullRequest, detachPullRequest,
        attachIssue, detachIssue, syncTask,
    } = useGithub();

    const [prInput, setPrInput] = useState('');
    const [issueInput, setIssueInput] = useState('');
    const [busy, setBusy] = useState('');       // 'pr' | 'issue' | 'sync'
    const [error, setError] = useState('');

    const dark = theme === 'dark';

    // Always read the freshest copy from context — attaching mutates it.
    const live = tasks.find(t => t._id === task?._id) || task;
    const gh = live?.github || {};
    const pr = gh.pullRequest;
    const issue = gh.issue;

    const field = `w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all ${dark
        ? 'bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan/50'
        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-neon-cyan/50'
        }`;

    const run = async (key, fn) => {
        setBusy(key);
        setError('');
        try {
            await fn();
        } catch (err) {
            setError(githubErrorMessage(err));
        } finally {
            setBusy('');
        }
    };

    if (!connected) {
        return (
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-950/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <FiGithub size={13} className="text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">GitHub</span>
                    <SyncStatusBadge status="not_connected" />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Connect a repository to this project from the GitHub tab to link pull requests and issues to tasks.
                </p>
            </div>
        );
    }

    if (!live?._id) {
        return (
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-950/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <FiGithub size={13} className="text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">GitHub</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Save this task first, then reopen it to attach a pull request or issue.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <FiGithub size={13} className={dark ? 'text-white' : 'text-slate-800'} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">GitHub</span>
                    <SyncStatusBadge status={gh.syncStatus || 'not_connected'} />
                </div>
                <div className="flex items-center gap-3">
                    {gh.lastSync && (
                        <span className="text-[9px] text-slate-600">Synced {timeAgo(gh.lastSync)}</span>
                    )}
                    {(pr?.number || issue?.number) && (
                        <button
                            type="button"
                            onClick={() => run('sync', () => syncTask(live._id))}
                            disabled={busy === 'sync'}
                            title="Re-check GitHub now"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-white/5 transition-all disabled:opacity-50"
                        >
                            <FiRefreshCw size={12} className={busy === 'sync' ? 'animate-spin' : ''} />
                        </button>
                    )}
                </div>
            </div>

            {/* Auto-completion banner (Feature 5) */}
            <AnimatePresence>
                {gh.autoCompleted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-electric-purple/10 border border-emerald-500/30"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
                            className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0"
                        >
                            <FiZap size={15} />
                        </motion.div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                Completed Automatically
                            </p>
                            <p className={`text-xs font-bold mt-1 ${dark ? 'text-white' : 'text-slate-800'}`}>
                                {gh.autoCompletedReason}
                            </p>
                            {gh.autoCompletedAt && (
                                <p className="text-[10px] text-slate-500 mt-1 inline-flex items-center gap-1">
                                    <FiClock size={9} /> {formatDateTime(gh.autoCompletedAt)} · {timeAgo(gh.autoCompletedAt)}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                            <FiAlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-rose-300 leading-relaxed">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pull request */}
            {pr?.number ? (
                <PullRequestCard
                    pullRequest={pr}
                    onDetach={() => run('pr', () => detachPullRequest(live._id))}
                />
            ) : (
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Attach Pull Request
                    </label>
                    <div className="flex gap-2">
                        <input
                            className={field}
                            placeholder="42  or  https://github.com/owner/repo/pull/42"
                            value={prInput}
                            onChange={(e) => setPrInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (prInput.trim()) {
                                        run('pr', async () => {
                                            await attachPullRequest(live._id, prInput.trim());
                                            setPrInput('');
                                        });
                                    }
                                }
                            }}
                        />
                        <button
                            type="button"
                            disabled={!prInput.trim() || busy === 'pr'}
                            onClick={() => run('pr', async () => {
                                await attachPullRequest(live._id, prInput.trim());
                                setPrInput('');
                            })}
                            className="px-4 shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-40"
                            aria-label="Attach pull request"
                        >
                            {busy === 'pr'
                                ? <FiLoader size={15} className="animate-spin" />
                                : <VscGitPullRequest size={15} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Issue */}
            {issue?.number ? (
                <IssueCard issue={issue} onDetach={() => run('issue', () => detachIssue(live._id))} />
            ) : (
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Attach Issue
                    </label>
                    <div className="flex gap-2">
                        <input
                            className={field}
                            placeholder="18  or  https://github.com/owner/repo/issues/18"
                            value={issueInput}
                            onChange={(e) => setIssueInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (issueInput.trim()) {
                                        run('issue', async () => {
                                            await attachIssue(live._id, issueInput.trim());
                                            setIssueInput('');
                                        });
                                    }
                                }
                            }}
                        />
                        <button
                            type="button"
                            disabled={!issueInput.trim() || busy === 'issue'}
                            onClick={() => run('issue', async () => {
                                await attachIssue(live._id, issueInput.trim());
                                setIssueInput('');
                            })}
                            className="px-4 shrink-0 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan hover:text-midnight transition-all disabled:opacity-40"
                            aria-label="Attach issue"
                        >
                            {busy === 'issue'
                                ? <FiLoader size={15} className="animate-spin" />
                                : <VscIssues size={15} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Commit history (Feature 6) */}
            {gh.commitHistory?.length > 0 && (
                <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-950/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <CommitTimeline commits={gh.commitHistory} />
                </div>
            )}

            {/* Task activity (Feature 10) */}
            {gh.activity?.length > 0 && (
                <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-950/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <FiActivity size={12} className="text-neon-cyan" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">GitHub Activity</h4>
                    </div>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                        {gh.activity.map((event, i) => (
                            <motion.div
                                key={`${event.type}-${i}`}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                                className="flex items-start gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan mt-1.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-neon-cyan">
                                            {ACTIVITY_LABELS[event.type] || event.type}
                                        </span>
                                        <span className="text-[9px] text-slate-600 shrink-0">{timeAgo(event.timestamp)}</span>
                                    </div>
                                    <p className={`text-[11px] mt-0.5 leading-snug ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {event.message}
                                        {event.actor && <span className="text-slate-500"> · {event.actor}</span>}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {!pr?.number && !issue?.number && !gh.activity?.length && (
                <EmptyState
                    icon={FiGithub}
                    title="Nothing linked yet"
                    description="Attach a pull request and this task will complete itself the moment that PR is merged."
                    theme={theme}
                    compactMode
                />
            )}
        </div>
    );
};

export default TaskGithubPanel;
