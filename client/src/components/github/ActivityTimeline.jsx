import React from 'react';
import { motion } from 'framer-motion';
import { FiGitCommit, FiTag, FiGitBranch, FiActivity, FiExternalLink } from 'react-icons/fi';
// VscPass stands in for a closed issue — react-icons v5 has no VscIssueClosed.
import { VscGitPullRequest, VscGitMerge, VscIssues, VscPass } from 'react-icons/vsc';
import { useDashboard } from '../../context/DashboardContext';
import { timeAgo, formatDateTime, EmptyState, Skeleton } from './githubUi';

/** Picks the icon + colour for a repository event (Feature 7). */
const decorate = (event) => {
    if (event.type === 'pull_request') {
        if (event.action === 'merged') {
            return { Icon: VscGitMerge, tone: 'text-electric-purple', bg: 'bg-electric-purple/10', ring: 'border-electric-purple/40', label: `Merged PR #${event.number}` };
        }
        if (event.action === 'closed') {
            return { Icon: VscGitPullRequest, tone: 'text-rose-400', bg: 'bg-rose-500/10', ring: 'border-rose-500/40', label: `Closed PR #${event.number}` };
        }
        return { Icon: VscGitPullRequest, tone: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'border-emerald-500/40', label: `Opened PR #${event.number}` };
    }

    if (event.type === 'issue') {
        return event.action === 'closed'
            ? { Icon: VscPass, tone: 'text-electric-purple', bg: 'bg-electric-purple/10', ring: 'border-electric-purple/40', label: `Closed Issue #${event.number}` }
            : { Icon: VscIssues, tone: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'border-emerald-500/40', label: `Opened Issue #${event.number}` };
    }

    if (event.type === 'release') {
        return { Icon: FiTag, tone: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'border-amber-500/40', label: 'New Release' };
    }

    if (event.type === 'branch') {
        return { Icon: FiGitBranch, tone: 'text-neon-cyan', bg: 'bg-neon-cyan/10', ring: 'border-neon-cyan/40', label: 'New Branch' };
    }

    return { Icon: FiGitCommit, tone: 'text-slate-400', bg: 'bg-white/5', ring: 'border-white/20', label: 'Commit' };
};

/** Chronological repository feed. */
const ActivityTimeline = ({ activity = [], loading = false, limit }) => {
    const { theme } = useDashboard();
    const dark = theme === 'dark';

    const events = limit ? activity.slice(0, limit) : activity;

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-2 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!events.length) {
        return (
            <EmptyState
                icon={FiActivity}
                title="No recent activity"
                description="Commits, pull requests, issues and releases from this repository will appear here."
                theme={theme}
                compactMode
            />
        );
    }

    return (
        <div className="relative">
            <div className={`absolute left-[17px] top-3 bottom-3 w-px ${dark ? 'bg-white/10' : 'bg-slate-200'}`} />

            <div className="space-y-1">
                {events.map((event, i) => {
                    const { Icon, tone, bg, ring, label } = decorate(event);
                    return (
                        <motion.a
                            key={`${event.type}-${event.number || event.sha || i}`}
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.035, 0.5) }}
                            className={`relative flex gap-4 group rounded-2xl px-3 py-2.5 -mx-1 transition-all ${dark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
                                }`}
                        >
                            <div className={`relative z-10 w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border-2 ${dark ? 'bg-slate-950' : 'bg-white'} ${ring} ${tone}`}>
                                <Icon size={15} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${tone}`}>
                                        {label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 shrink-0" title={formatDateTime(event.timestamp)}>
                                        {timeAgo(event.timestamp)}
                                    </span>
                                </div>

                                <p className={`text-xs font-medium mt-1 leading-snug line-clamp-2 ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {event.title}
                                </p>

                                <div className="flex items-center gap-2 mt-1.5">
                                    {event.actorAvatar && (
                                        <img src={event.actorAvatar} alt={event.actor} className="w-3.5 h-3.5 rounded" />
                                    )}
                                    {event.actor && (
                                        <span className="text-[10px] font-bold text-slate-500">{event.actor}</span>
                                    )}
                                    {event.sha && (
                                        <code className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${dark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>
                                            {event.sha.slice(0, 7)}
                                        </code>
                                    )}
                                    <FiExternalLink
                                        size={10}
                                        className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                    />
                                </div>
                            </div>
                        </motion.a>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityTimeline;
