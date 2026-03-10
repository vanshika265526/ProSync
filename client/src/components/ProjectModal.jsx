import React, { useState } from 'react';
import { FiX, FiPlus, FiUserPlus, FiTrash2, FiMail } from 'react-icons/fi';
import { useDashboard } from '../context/DashboardContext';

const ProjectModal = ({ isOpen, onClose, projectToEdit }) => {
    const { addProject, updateProject, theme, userProfile, currentUserRole } = useDashboard();
    const isAdmin = !projectToEdit || ['Owner', 'Admin'].includes(currentUserRole);
    const [memberInput, setMemberInput] = useState('');
    const [project, setProject] = useState(projectToEdit || {
        name: '',
        status: 'Active',
        deadline: new Date().toISOString().split('T')[0],
        type: 'Private Board',
        description: '',
        team: [{ ...userProfile, _id: userProfile?.id, id: 'me', role: 'Owner', isOwner: true }], // Include user by default
        tasks: []
    });

    const addMember = () => {
        if (!memberInput || !memberInput.includes('@')) return;

        // Prevent adding self
        if (memberInput === userProfile?.email || project.team.some(m => m.email === memberInput)) {
            setMemberInput('');
            return;
        }

        const newMember = {
            id: Date.now(),
            name: memberInput.split('@')[0],
            email: memberInput,
            role: 'Contributor',
            avatar: `https://i.pravatar.cc/150?u=${memberInput}`
        };
        setProject({
            ...project,
            team: [...project.team, newMember]
        });
        setMemberInput('');
    };

    const removeMember = (id) => {
        setProject({
            ...project,
            team: project.team.filter(m => m.id !== id)
        });
    };

    const addTaskToProject = () => {
        setProject({
            ...project,
            tasks: [...project.tasks, { title: '', priority: 'Medium', subtasks: [] }]
        });
    };

    const updateTaskInProject = (index, field, value) => {
        const newTasks = [...project.tasks];
        newTasks[index][field] = value;
        setProject({ ...project, tasks: newTasks });
    };

    const removeTaskFromProject = (index) => {
        const newTasks = project.tasks.filter((_, i) => i !== index);
        setProject({ ...project, tasks: newTasks });
    };

    const addSubtaskToTask = (taskIndex) => {
        const newTasks = [...project.tasks];
        newTasks[taskIndex].subtasks = [
            ...newTasks[taskIndex].subtasks,
            { id: Date.now(), title: '', completed: false }
        ];
        setProject({ ...project, tasks: newTasks });
    };

    const updateSubtaskInTask = (taskIndex, subtaskIndex, value) => {
        const newTasks = [...project.tasks];
        newTasks[taskIndex].subtasks[subtaskIndex].title = value;
        setProject({ ...project, tasks: newTasks });
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (projectToEdit) {
            updateProject(projectToEdit._id, project);
        } else {
            addProject(project);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-electric-purple"></div>
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-rose-500 transition-colors">
                    <FiX size={24} />
                </button>

                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-8`}>
                    {projectToEdit ? 'Edit Project' : 'New Project'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Project Name</label>
                        <input
                            type="text"
                            required
                            disabled={!isAdmin}
                            className={`w-full ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white focus:border-neon-cyan/50' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-neon-cyan/50'} rounded-xl p-3 focus:outline-none transition-all ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={project.name}
                            onChange={e => setProject({ ...project, name: e.target.value })}
                        />
                    </div>



                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Project Type</label>
                        <select
                            disabled={!isAdmin}
                            className={`w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-cyan/50 appearance-none ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={project.type}
                            onChange={e => setProject({ ...project, type: e.target.value })}
                        >
                            <option value="Private Board">Private Board</option>
                            <option value="Team Board">Team Board</option>
                            <option value="Public Project">Public Project</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
                            <select
                                disabled={!isAdmin}
                                className={`w-full ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white focus:border-neon-cyan/50' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-neon-cyan/50'} rounded-xl p-3 focus:outline-none transition-all appearance-none ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                value={project.status}
                                onChange={e => setProject({ ...project, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Deadline</label>
                            <input
                                type="date"
                                disabled={!isAdmin}
                                className={`w-full ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white focus:border-neon-cyan/50' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-neon-cyan/50'} rounded-xl p-3 focus:outline-none transition-all ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                value={project.deadline}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setProject({ ...project, deadline: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Team Members Invite Section */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Team Members</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="Enter email to invite..."
                                    className={`w-full pl-10 pr-3 py-3 ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl focus:outline-none focus:border-neon-cyan/50 text-xs transition-all`}
                                    value={memberInput}
                                    onChange={e => setMemberInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addMember())}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addMember}
                                className="px-4 py-3 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-xl hover:bg-neon-cyan hover:text-midnight transition-all group"
                            >
                                <FiPlus className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {project.team.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {project.team.map((m) => (
                                    <div key={m._id || m.id || m.email} className={`flex items-center gap-2 px-2 py-1.5 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'} border rounded-lg animate-in fade-in zoom-in duration-200`}>
                                        <img src={m.avatar} className="w-5 h-5 rounded-md" alt={m.name} />
                                        <div className="flex flex-col">
                                            <span className={`text-[9px] font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>{m.name}</span>
                                        </div>
                                        {m._id !== userProfile?.id && m.id !== 'me' && !m.isOwner && (
                                            <button
                                                type="button"
                                                onClick={() => removeMember(m.id)}
                                                className="ml-1 text-slate-500 hover:text-rose-500 transition-colors"
                                            >
                                                <FiX size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Initial Tasks Section */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Initial Tasks</label>
                            <button
                                type="button"
                                onClick={addTaskToProject}
                                className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest hover:underline"
                            >
                                + Add Task
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {project.tasks.map((task, tIdx) => (
                                <div key={tIdx} className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl relative group/task">
                                    <button
                                        type="button"
                                        onClick={() => removeTaskFromProject(tIdx)}
                                        className="absolute top-2 right-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover/task:opacity-100 transition-all"
                                    >
                                        <FiX size={14} />
                                    </button>

                                    <div className="space-y-3">
                                        <input
                                            placeholder="Task Title"
                                            className="w-full bg-transparent border-b border-white/10 pb-1 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
                                            value={task.title}
                                            onChange={e => updateTaskInProject(tIdx, 'title', e.target.value)}
                                        />

                                        <div className="flex items-center gap-4">
                                            <select
                                                className="bg-transparent text-[10px] font-bold text-slate-400 uppercase tracking-widest focus:outline-none"
                                                value={task.priority}
                                                onChange={e => updateTaskInProject(tIdx, 'priority', e.target.value)}
                                            >
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                            </select>

                                            <select
                                                className="bg-transparent text-[10px] font-bold text-slate-400 uppercase tracking-widest focus:outline-none"
                                                value={task.members ? task.members[0] : ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    updateTaskInProject(tIdx, 'members', [val]);
                                                }}
                                            >
                                                <option value="">Assign To...</option>
                                                <option value="me">Me ({userProfile?.name || 'User'})</option>
                                                {project.team
                                                    .filter(m => m._id !== userProfile?.id && m.id !== 'me' && m.email !== userProfile?.email)
                                                    .map(m => (
                                                        <option key={m._id || m.id || m.email} value={m._id || m.id || m.email}>{m.name}</option>
                                                    ))}
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => addSubtaskToTask(tIdx)}
                                                className="text-[10px] font-bold text-slate-500 hover:text-neon-cyan uppercase tracking-widest"
                                            >
                                                + Subtask
                                            </button>
                                        </div>

                                        {task.subtasks.length > 0 && (
                                            <div className="pl-4 space-y-2 pt-2">
                                                {task.subtasks.map((st, stIdx) => (
                                                    <input
                                                        key={st.id}
                                                        placeholder="Subtask..."
                                                        className="w-full bg-transparent border-b border-white/5 pb-1 text-[11px] text-slate-400 focus:outline-none focus:border-neon-cyan/30"
                                                        value={st.title}
                                                        onChange={e => updateSubtaskInTask(tIdx, stIdx, e.target.value)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {project.tasks.length === 0 && (
                                <div className="text-center py-4 border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No tasks added yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-gradient-to-r from-neon-cyan to-electric-purple text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all"
                        >
                            {projectToEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal;
