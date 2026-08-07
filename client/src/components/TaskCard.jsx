import React, { useMemo } from "react";
import { FiCalendar, FiMoreHorizontal, FiCheckSquare, FiTrendingUp, FiTrash2, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import PullRequestCard from "./github/PullRequestCard";
import IssueCard from "./github/IssueCard";
import { SyncStatusBadge } from "./github/githubUi";

const TaskCard = ({ _id: id, title, tags, date, members, subtasks, priority, status, github, onEdit, ...props }) => {
  const { toggleSubtask, deleteTask, updateTask, theme, projects, activeProjectId, userProfile, currentUserRole } = useDashboard();
  const navigate = useNavigate();
  const activeProject = projects.find(p => p._id === activeProjectId);
  const getTagStyles = (color) => {
    const styles = {
      purple: "border border-electric-purple text-electric-purple shadow-[0_0_8px_rgba(125,0,255,0.2)] bg-electric-purple/5",
      cyan: "border border-neon-cyan text-neon-cyan shadow-[0_0_8px_rgba(0,242,234,0.2)] bg-neon-cyan/5",
      pink: "border border-pink-500 text-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.2)] bg-pink-500/5",
      yellow: "border border-yellow-400 text-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.2)] bg-yellow-400/5",
      red: "border border-red-500 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)] bg-red-500/5",
      green: "border border-emerald-400 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)] bg-emerald-400/5",
      orange: "border border-orange-500 text-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.2)] bg-orange-500/5",
      slate: "border border-slate-500 text-slate-400 bg-slate-500/5"
    };
    return styles[color] || styles.slate;
  };
  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return 'text-rose-500';
      case 'Medium': return 'text-amber-500';
      case 'Low': return 'text-emerald-500';
      default: return 'text-slate-500';
    }
  };
  const taskProgress = useMemo(() => {
    if (subtasks && subtasks.length > 0) {
      const completed = subtasks.filter(s => s.completed).length;
      return {
        completed,
        total: subtasks.length,
        percent: Math.round((completed / subtasks.length) * 100),
        hasSubtasks: true
      };
    }
    if (status === 'Done') return { percent: 100, hasSubtasks: false };
    return null;
  }, [subtasks, status]);
  return (
    <div
      onClick={() => currentUserRole === 'Admin' && onEdit && onEdit()}
      className={`${theme === 'dark' ? 'bg-slate-900/60 border-white/5 shadow-xl hover:border-neon-cyan/40' : 'bg-white border-slate-200 shadow-md hover:border-neon-cyan/60'} p-3.5 rounded-2xl border transition-all group hover:shadow-[0_10px_30px_rgba(0,242,234,0.05)] ${currentUserRole === 'Admin' ? 'cursor-pointer' : ''} relative overflow-hidden active:scale-95`}
    >
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full bg-current ${getPriorityColor(priority)} opacity-50`}></div>

      <div className="flex justify-between items-start mb-3">
        <div className={`flex items-center gap-1 text-[7px] font-bold uppercase tracking-widest ${getPriorityColor(priority)}`}>
          <FiTrendingUp /> {priority}
        </div>
        <div className="flex items-center gap-1">
          {status === 'Todo' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateTask(id, { status: 'In Progress' });
              }}
              className="p-1 px-2 rounded-lg bg-neon-cyan/10 text-neon-cyan text-[8px] font-black uppercase tracking-tighter hover:bg-neon-cyan hover:text-midnight transition-all opacity-0 group-hover:opacity-100"
            >
              Start
            </button>
          )}
          {status === 'In Progress' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask(id, { status: 'Review' });
                }}
                className="p-1 px-2 rounded-lg bg-electric-purple/10 text-electric-purple text-[8px] font-black uppercase tracking-tighter hover:bg-electric-purple hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                Review
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask(id, { status: 'Done', subtasks: (subtasks || []).map(s => ({ ...s, completed: true })) });
                }}
                className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-tighter hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                Done
              </button>
            </>
          )}
          {status === 'Review' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateTask(id, { status: 'Done', subtasks: (subtasks || []).map(s => ({ ...s, completed: true })) });
              }}
              className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-tighter hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              Complete
            </button>
          )}
          {status === 'Done' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask(id, { status: 'Review' });
                }}
                className="p-1 px-2 rounded-lg bg-electric-purple/10 text-electric-purple text-[8px] font-black uppercase tracking-tighter hover:bg-electric-purple hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                Review
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask(id, { status: 'In Progress' });
                }}
                className="p-1 px-2 rounded-lg bg-neon-cyan/10 text-neon-cyan text-[8px] font-black uppercase tracking-tighter hover:bg-neon-cyan hover:text-midnight transition-all opacity-0 group-hover:opacity-100"
              >
                Re-open
              </button>
            </>
          )}
          {currentUserRole === 'Admin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this task?')) deleteTask(id);
              }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <FiTrash2 size={14} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }} className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/5 transition-all text-[10px]">
            <FiMoreHorizontal />
          </button>
        </div>
      </div>

      <h4 className={`text-[10.5px] font-black ${theme === 'dark' ? 'text-slate-100' : 'text-black'} group-hover:text-neon-cyan transition-colors leading-relaxed mb-2.5`}>
        {title}
      </h4>

      <div className="flex flex-wrap gap-2 mb-3">
        {tags && tags.map((tag, i) => (
          <span key={i} className={`text-[7px] font-bold px-1.5 py-0.5 rounded-lg border ${getTagStyles(tag.color)} uppercase tracking-tighter`}>
            {tag.label}
          </span>
        ))}
      </div>

      {/* GitHub links + sync indicator (Features 3, 4, 8) */}
      {(github?.pullRequest?.number || github?.issue?.number || github?.autoCompleted) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {github.pullRequest?.number && (
            <PullRequestCard pullRequest={github.pullRequest} compactMode />
          )}
          {github.issue?.number && (
            <IssueCard issue={github.issue} compactMode />
          )}
          {github.autoCompleted && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-tighter"
              title={github.autoCompletedReason}
            >
              <FiZap size={9} /> Auto
            </span>
          )}
          <SyncStatusBadge
            status={github.syncStatus || 'not_connected'}
            showLabel={false}
            title={github.syncError || undefined}
          />
        </div>
      )}

      {taskProgress && (
        <div className="mb-3">
          <div className="flex justify-between text-[9px] font-black mb-1 uppercase tracking-tighter">
            <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-1`}>
              {taskProgress.hasSubtasks ? <><FiCheckSquare /> Subtasks</> : <><FiCheckSquare /> Status</>}
            </span>
            <span className="text-neon-cyan">
              {taskProgress.hasSubtasks ? `${taskProgress.completed}/${taskProgress.total}` : 'Complete'}
            </span>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${taskProgress.percent === 100 ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-gradient-to-r from-neon-cyan to-electric-purple shadow-[0_0_8px_rgba(0,242,234,0.5)]'} rounded-full transition-all duration-700`}
              style={{ width: `${taskProgress.percent}%` }}
            ></div>
          </div>
        </div>
      )}

      {subtasks && subtasks.length > 0 && (
        <div className="space-y-1.5 mb-3 max-h-24 overflow-y-auto no-scrollbar py-1">
          {subtasks.map((st) => (
            <div
              key={st._id || st.id}
              onClick={(e) => {
                e.stopPropagation();
                toggleSubtask(id, st._id || st.id);
              }}
              className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${st.completed
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                }`}
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${st.completed ? 'bg-emerald-400 border-emerald-400 text-midnight' : 'border-slate-700'
                }`}>
                {st.completed && <FiCheckSquare size={10} className="stroke-[3]" />}
              </div>
              <span className={`text-[9px] font-bold leading-none truncate ${st.completed ? 'opacity-50 line-through' : ''}`}>
                {st.title || st.text}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={`flex items-center justify-between pt-3 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} mt-1`}>
        <div className="flex flex-col gap-1">
          <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-[7px] font-black uppercase tracking-widest`}>
            <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-900'}>Added:</span>
            <span>{id > 1739000000000 ? new Date(props.createdAt || date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : date}</span>
          </div>
          <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} text-[8px] font-black uppercase tracking-widest`}>
            <FiCalendar className="text-neon-cyan" />
            <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>Due:</span>
            <span className="text-neon-cyan">{props.deadline ? new Date(props.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}</span>
          </div>
        </div>

        <div className="flex -space-x-2">
          {members && members.map((memberId, i) => {
            const isMe = memberId === 'me' || memberId === userProfile?.id;
            const member = isMe ? userProfile : activeProject?.team?.find(m => m._id === memberId || m.id === memberId);

            if (!member) return null;

            return (
              <img
                key={i}
                src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`}
                title={`View ${isMe ? 'your' : `${member.name}'s`} profile`}
                onClick={(e) => {
                  // Don't let the click bubble up into "open task"
                  e.stopPropagation();
                  navigate(isMe ? '/profile' : `/profile/${encodeURIComponent(member.email || member.id || member._id)}`);
                }}
                className="w-5 h-5 rounded-lg border-2 border-slate-900 group-hover:border-neon-cyan/50 transition-all hover:z-10 hover:scale-125 cursor-pointer"
              />
            );
          })}
          {(!members || members.length === 0) && (
            <div className="w-5 h-5 rounded-lg bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[7px] font-bold text-white z-0 opacity-40">?</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
