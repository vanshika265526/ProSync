import React from 'react';
import { FiMail, FiShield, FiUser, FiMoreVertical, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import { useDashboard } from '../context/DashboardContext';

const MembersView = () => {
    const { projects, tasks, activeProjectId, theme, updateProject, updateTask, userProfile, currentUserRole } = useDashboard();
    const [memberInput, setMemberInput] = React.useState('');
    const [activeMenuId, setActiveMenuId] = React.useState(null);
    const [assignmentOpenId, setAssignmentOpenId] = React.useState(null);
    const [copied, setCopied] = React.useState(false);

    const activeProject = projects.find(p => p._id === activeProjectId) || projects[0];
    const team = activeProject?.team || [];

    const getMemberStats = React.useCallback((memberId) => {
        const memberTasks = tasks.filter(t => {
            if (t.projectId !== activeProjectId) return false;
            const members = t.members || [];
            const isTarget = (memberIdInTask) => {
                if (memberIdInTask === memberId) return true;

                const targetMember = activeProject?.team?.find(m => m._id === memberId || m.id === memberId || m.email === memberId);
                const taskMember = activeProject?.team?.find(m => m._id === memberIdInTask || m.id === memberIdInTask || m.email === memberIdInTask);

                if (targetMember && taskMember && targetMember.email === taskMember.email) return true;

                // Handle 'me'
                if (memberIdInTask === 'me' || memberIdInTask === userProfile?.id) {
                    return memberId === 'me' || memberId === userProfile?.id || memberId === userProfile?.email;
                }

                return false;
            };

            const isAssigned = members.some(mId => isTarget(mId));
            if (!isAssigned) return false;
            return true;
        });

        if (memberTasks.length === 0) return { count: 0, progress: 0, tasks: [] };

        let totalProgress = 0;
        memberTasks.forEach(t => {
            if (t.subtasks && t.subtasks.length > 0) {
                const completed = t.subtasks.filter(s => s.completed).length;
                totalProgress += (completed / t.subtasks.length) * 100;
            } else if (t.status === 'Done') {
                totalProgress += 100;
            }
        });

        return {
            count: memberTasks.length,
            progress: Math.round(totalProgress / memberTasks.length),
            tasks: memberTasks
        };
    }, [tasks, activeProjectId]);

    const toggleTaskAssignment = (taskId, memberId) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        const currentMembers = task.members || [];
        const newMembers = currentMembers.includes(memberId)
            ? currentMembers.filter(id => id !== memberId)
            : [...currentMembers, memberId];

        updateTask(taskId, { members: newMembers });
    };

    const projectTasks = tasks.filter(t => t.projectId === activeProjectId);

    // Combine team with the current user ("Me")
    const displayTeam = React.useMemo(() => {
        if (!activeProject) return [];
        const baseTeam = activeProject.team || [];

        // Filter out any baseTeam members that share email/id with "Me"
        const filteredTeam = baseTeam.filter(m => m.id !== 'me' && m.id !== userProfile?.id && m.email !== userProfile?.email);

        const isOwner = activeProject.user === userProfile?.id || activeProject.user === 'demo_user_123';
        const userRole = isOwner ? 'Owner' : (baseTeam.find(m => m.email === userProfile?.email)?.role || 'Member');

        return [
            {
                ...userProfile,
                role: userRole,
                isOwner: isOwner
            },
            ...filteredTeam
        ];
    }, [activeProject, userProfile]);

    if (!activeProject) return null;

    const addMember = () => {
        if (!memberInput || !memberInput.includes('@')) return;

        // Prevent adding self or duplicates
        if (memberInput === userProfile?.email || team.some(m => m.email === memberInput)) {
            setMemberInput('');
            return;
        }

        const newMember = {
            _id: `temp_${Date.now()}`,
            id: Date.now(),
            name: memberInput.split('@')[0],
            email: memberInput,
            role: 'Contributor',
            avatar: `https://i.pravatar.cc/150?u=${memberInput}`,
            assignedProjects: [activeProject.name]
        };
        const updatedTeam = [...team, newMember];
        updateProject(activeProject._id, { team: updatedTeam });
        setMemberInput('');
    };

    const removeMember = (id) => {
        const updatedTeam = team.filter(m => m._id !== id && m.id !== id);
        updateProject(activeProject._id, { team: updatedTeam });
    };

    const changeRole = (id, newRole) => {
        const updatedTeam = team.map(m => (m._id === id || m.id === id) ? { ...m, role: newRole } : m);
        updateProject(activeProject._id, { team: updatedTeam });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Team Members</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage collaborators for <span className="text-neon-cyan font-bold">{activeProject.name}</span></p>
                </div>
                {['Owner', 'Admin'].includes(currentUserRole) && (
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-cyan transition-colors" />
                            <input
                                type="email"
                                placeholder="Add member by email..."
                                className={`pl-10 pr-4 py-2 text-xs border rounded-xl focus:outline-none focus:border-neon-cyan/50 transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                                    }`}
                                value={memberInput}
                                onChange={(e) => setMemberInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addMember()}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    const link = `${window.location.origin}/signup?join=${activeProject._id}`;
                                    navigator.clipboard.writeText(link);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl border transition-all ${copied
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                                    : 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-midnight'
                                    }`}
                            >
                                {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Link</>}
                            </button>
                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                {team.length} Members Total
                            </div>
                        </div>
                    </div>
                )}
                {!['Owner', 'Admin'].includes(currentUserRole) && (
                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {team.length} Members Total
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTeam.map((member) => {
                    const memberId = member._id || member.id;
                    const stats = getMemberStats(memberId);
                    return (
                        <div
                            key={memberId}
                            className={`group p-6 border rounded-3xl transition-all hover:scale-[1.01] flex flex-col ${theme === 'dark'
                                ? 'bg-slate-900/50 border-white/5 hover:border-neon-cyan/30'
                                : 'bg-white border-slate-200 hover:border-neon-cyan/30 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-neon-cyan/20 group-hover:ring-neon-cyan/50 transition-all"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{member.name}</h3>
                                        <select
                                            disabled={member.isOwner || (currentUserRole !== 'Owner' && currentUserRole !== 'Admin')}
                                            className={`text-[10px] font-bold uppercase tracking-widest bg-transparent text-neon-cyan border-none focus:outline-none cursor-pointer hover:underline disabled:no-underline disabled:cursor-default`}
                                            value={member.role}
                                            onChange={(e) => changeRole(member.id, e.target.value)}
                                        >
                                            <option value="Owner" disabled={!member.isOwner}>Owner</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Contributor">Contributor</option>
                                            <option value="Viewer">Viewer</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                                    >
                                        <FiMoreVertical size={16} />
                                    </button>

                                    {activeMenuId === member.id && (
                                        <div className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in duration-200 ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                                            <div className="p-2 space-y-1">
                                                <button
                                                    onClick={() => { setAssignmentOpenId(memberId); setActiveMenuId(null); }}
                                                    className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-neon-cyan' : 'text-slate-500 hover:bg-slate-50 hover:text-neon-cyan'}`}
                                                >
                                                    Modify Tasks
                                                </button>
                                                <button className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                                                    View Activity
                                                </button>
                                                {!member.isOwner && (
                                                    <>
                                                        <div className={`h-px my-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                                                        <button
                                                            onClick={() => removeMember(memberId)}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"
                                                        >
                                                            Remove Member
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                                    <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-neon-cyan' : 'text-electric-purple'}`}>{stats.progress}%</span>
                                </div>
                                <div className={`h-1.5 w-full rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} overflow-hidden`}>
                                    <div
                                        className="h-full bg-gradient-to-r from-neon-cyan to-electric-purple transition-all duration-1000"
                                        style={{ width: `${stats.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Assigned Tasks */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Assigned Tasks ({stats.count})</span>
                                    <button
                                        onClick={() => setAssignmentOpenId(assignmentOpenId === memberId ? null : memberId)}
                                        className="text-[9px] font-bold text-neon-cyan uppercase tracking-widest hover:underline"
                                    >
                                        {assignmentOpenId === memberId ? 'Close' : 'Manage'}
                                    </button>
                                </div>

                                {assignmentOpenId === memberId && (
                                    <div className={`mb-4 p-3 rounded-2xl border animate-in slide-in-from-top-2 duration-300 ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Toggle Assignments</p>
                                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                            {projectTasks.map(task => {
                                                const isAssigned = task.members?.includes(memberId);
                                                return (
                                                    <button
                                                        key={task._id}
                                                        onClick={() => toggleTaskAssignment(task._id, memberId)}
                                                        className={`w-full text-left p-2 rounded-lg text-[10px] flex items-center justify-between transition-all group/item ${isAssigned
                                                            ? (theme === 'dark' ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' : 'bg-neon-cyan/5 text-midnight border border-neon-cyan/30')
                                                            : (theme === 'dark' ? 'text-slate-500 hover:bg-white/5' : 'text-slate-50 hover:bg-slate-100 hover:text-slate-700')
                                                            }`}
                                                    >
                                                        <span className="truncate pr-2 font-medium">{task.title}</span>
                                                        <div className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${isAssigned ? 'bg-neon-cyan border-neon-cyan' : 'border-slate-500 group-hover/item:border-neon-cyan'}`}>
                                                            {isAssigned && <div className="w-1.5 h-1.5 bg-midnight rounded-full scale-110"></div>}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                    {stats.tasks.length > 0 ? (
                                        stats.tasks.map(task => (
                                            <div key={task._id} className={`p-2 rounded-xl text-[11px] font-medium border ${theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="truncate">{task.title}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${task.status === 'Done' ? 'bg-green-500/20 text-green-500' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-slate-600 italic">No tasks assigned yet</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                <button className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'} transition-all flex items-center gap-2`}>
                                    <FiUser size={12} /> {member.isOwner ? 'Your Profile' : 'Profile'}
                                </button>
                                {!member.isOwner && (
                                    <button
                                        onClick={() => removeMember(member.id)}
                                        className="text-slate-500 hover:text-rose-500 transition-all font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {team.length === 0 && (
                    <div className={`col-span-full py-20 border-2 border-dashed ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'} rounded-3xl flex flex-col items-center justify-center text-center p-8`}>
                        <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-slate-900 text-slate-700' : 'bg-slate-200 text-slate-400'} rounded-2xl flex items-center justify-center mb-4`}>
                            <FiUser size={32} />
                        </div>
                        <h3 className={`font-bold text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>No team members yet</h3>
                        <p className="text-slate-500 text-sm max-w-xs">
                            This project is currently private. Use the invite section in settings to add collaborators.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersView;
