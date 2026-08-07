import React, { useState, useMemo } from 'react';
import { FiCheckSquare, FiCheck, FiChevronDown, FiChevronRight, FiUsers, FiCalendar, FiTrash2, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';

const ListView = ({ onEdit, isMyTasksView = false }) => {
    const { tasks, filteredTasks, toggleSubtask, updateTask, deleteTask, theme, projects, activeProjectId, userProfile, currentUserRole } = useDashboard();
    const navigate = useNavigate();

    const displayTasks = useMemo(() => {
        if (!isMyTasksView) return filteredTasks;
        const myId = userProfile?.id;
        const myEmail = userProfile?.email;
        const activeProject = projects.find(p => p._id === activeProjectId);

        return tasks.filter(t => {
            if (t.projectId !== activeProjectId) return false;
            const members = t.members || [];

            // Check if user is assigned directly by ID or Email
            const isAssignedDirectly =
                members.includes(myId) ||
                (myEmail && members.includes(myEmail)) ||
                members.includes('me') ||
                t.assignee === 'Me';

            if (isAssignedDirectly) return true;

            // Check if any ID in the members array belongs to a team member with my email
            // (Handles cases where an admin assigned a task to a placeholder ID before I joined)
            const isAssignedByPlaceholder = members.some(memberId => {
                const teamMember = activeProject?.team?.find(m => m._id === memberId || m.id === memberId || m.id === 'me');
                return teamMember && teamMember.email === myEmail;
            });

            return isAssignedByPlaceholder;
        });
    }, [isMyTasksView, filteredTasks, tasks, userProfile, activeProjectId, projects]);

    const activeProject = projects.find(p => p._id === activeProjectId);

    const [expandedTasks, setExpandedTasks] = useState(new Set());

    const toggleExpand = (taskId) => {
        const next = new Set(expandedTasks);
        if (next.has(taskId)) next.delete(taskId);
        else next.add(taskId);
        setExpandedTasks(next);
    };

    const calculateProgress = (task) => {
        if (task.subtasks && task.subtasks.length > 0) {
            const completed = task.subtasks.filter(s => s.completed).length;
            return Math.round((completed / task.subtasks.length) * 100);
        }
        return task.status === 'Done' ? 100 : 0;
    };

    return (
        <div className={`w-full rounded-3xl border overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-white border-slate-200 shadow-xl'
            }`}>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                            <th className={`px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] w-12 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-900'}`}></th>
                            <th className={`px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-900'}`}>Task Name</th>
                            <th className={`px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] w-48 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-900'}`}>Progress</th>
                            <th className={`px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] w-32 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-900'}`}>Priority</th>
                            {!isMyTasksView && <th className={`px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] w-32 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-900'}`}>Assignee</th>}
                            <th className={`px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] w-48 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-900'}`}>Due Date</th>
                            <th className={`px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] w-32 text-right ${theme === 'dark' ? 'text-slate-500' : 'text-slate-900'}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {displayTasks.length === 0 ? (
                            <tr>
                                <td colSpan={isMyTasksView ? "6" : "7"} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700">
                                            <FiCheckSquare size={24} />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">
                                            {isMyTasksView ? "You're all caught up! No tasks assigned to you." : "No tasks found matching current filters."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayTasks.map((task) => {
                                const progress = calculateProgress(task);
                                const isExpanded = expandedTasks.has(task._id);

                                return (
                                    <React.Fragment key={task._id}>
                                        <tr
                                            className={`group transition-all hover:bg-white/[0.03] ${isExpanded ? 'bg-white/[0.02]' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleExpand(task._id)}
                                                    className={`w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center transition-all ${isExpanded ? 'bg-neon-cyan text-midnight border-neon-cyan' : 'text-slate-500 hover:border-neon-cyan/50'}`}
                                                >
                                                    {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className={`flex flex-col gap-1 ${currentUserRole === 'Admin' ? 'cursor-pointer' : ''}`}
                                                    onClick={() => currentUserRole === 'Admin' && onEdit && onEdit(task)}
                                                >
                                                    <span className={`text-xs font-black transition-colors ${theme === 'dark' ? 'text-white group-hover:text-neon-cyan' : 'text-black group-hover:text-neon-cyan'
                                                        }`}>{task.title}</span>
                                                    <div className="flex items-center gap-2">
                                                        {task.tags?.map((tag, idx) => (
                                                            <span key={idx} className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-white/5 border border-white/5 text-slate-500`}>
                                                                {tag.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2 w-40">
                                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                                        <span className={progress === 100 ? 'text-emerald-400' : 'text-slate-500'}>
                                                            {progress === 100 ? 'Completed' : 'In Progress'}
                                                        </span>
                                                        <span className="text-neon-cyan">{progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,242,234,0.3)] ${progress === 100 ? 'bg-emerald-400 shadow-[0_0_10px_#34D399]' : 'bg-gradient-to-r from-neon-cyan to-electric-purple'}`}
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                                <span className={`px-3 py-1 rounded-full border border-white/5 bg-slate-900 ${task.priority === 'High' ? 'text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
                                                    task.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-400'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            {!isMyTasksView && (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {task.members && task.members.map((memberId, i) => {
                                                            const isMe = memberId === 'me' || memberId === userProfile?.id;
                                                            const member = isMe ? userProfile : activeProject?.team?.find(m => m._id === memberId || m.id === memberId);
                                                            return member ? (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(isMe ? '/profile' : `/profile/${encodeURIComponent(member.email || member.id || member._id)}`);
                                                                    }}
                                                                    title={`View ${isMe ? 'your' : `${member.name}'s`} profile`}
                                                                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                                                                >
                                                                    <img src={member.avatar} className="w-4 h-4 rounded-md" alt={member.name} />
                                                                    <span className="text-[9px] font-bold text-slate-400 hover:text-neon-cyan transition-colors">{isMe ? 'Me' : member.name}</span>
                                                                </button>
                                                            ) : (
                                                                <span key={i} className="text-[10px] font-bold text-slate-600">Unassigned</span>
                                                            );
                                                        })}
                                                        {(!task.members || task.members.length === 0) && (
                                                            <span className="text-[10px] font-bold text-slate-600">Unassigned</span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                                    <FiCalendar className="text-neon-cyan" />
                                                    {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (task.date || 'No Date')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-right">
                                                    {calculateProgress(task) < 100 && (
                                                        <button
                                                            onClick={() => {
                                                                updateTask(task._id, {
                                                                    status: 'Done',
                                                                    subtasks: (task.subtasks || []).map(s => ({ ...s, completed: true }))
                                                                });
                                                            }}
                                                            className="p-2 text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all group/done"
                                                            title="Mark as Done"
                                                        >
                                                            <FiCheckSquare size={16} className="group-hover/done:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                    {currentUserRole === 'Admin' && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Delete entire task?')) deleteTask(task._id);
                                                            }}
                                                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Subtasks Expanded Row */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="6" className="px-0 py-0">
                                                    <div className={`bg-slate-950/80 px-24 py-3 border-l-4 border-neon-cyan animate-in slide-in-from-top-4 duration-300 ${theme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-50 border-y border-slate-100'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h5 className="text-[8px] font-black text-neon-cyan uppercase tracking-[0.3em]">Milestones</h5>
                                                            <div className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                                                                {task.subtasks?.filter(s => s.completed).length || 0} OF {task.subtasks?.length || 0} COMPLETE
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-1.5">
                                                            {task.subtasks && task.subtasks.length > 0 ? (
                                                                task.subtasks.map((subtask) => (
                                                                    <div
                                                                        key={subtask._id || subtask.id}
                                                                        onClick={() => toggleSubtask(task._id, subtask._id || subtask.id)}
                                                                        className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${subtask.completed
                                                                            ? theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.05)]' : 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm'
                                                                            : theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${subtask.completed
                                                                            ? 'bg-emerald-400 border-emerald-400 text-midnight'
                                                                            : theme === 'dark' ? 'border-slate-700 group-hover:border-slate-500' : 'border-slate-200 group-hover:border-slate-400'
                                                                            }`}>
                                                                            {subtask.completed && <FiCheck size={12} className="stroke-[3]" />}
                                                                        </div>
                                                                        <span className={`text-[10px] font-black leading-tight ${subtask.completed ? 'opacity-60 line-through' : ''}`}>
                                                                            {subtask.title || subtask.text}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="col-span-2 py-8 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest">No milestones defined for this task</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListView;
