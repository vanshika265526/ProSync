import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiCheckSquare } from 'react-icons/fi';
import { useDashboard } from '../context/DashboardContext';
import TaskGithubPanel from './github/TaskGithubPanel';
import useModalDismiss from '../hooks/useModalDismiss';

const TaskModal = ({ isOpen, onClose, taskToEdit }) => {
    const { addTask, updateTask, activeProjectId, projects, userProfile, currentUserRole } = useDashboard();
    const activeProject = projects.find(p => p._id === activeProjectId);
    const isAdmin = currentUserRole === 'Admin';
    const [task, setTask] = useState(taskToEdit || {
        title: '',
        priority: 'Medium',
        status: 'Todo',
        date: new Date().toLocaleDateString(),
        deadline: new Date().toISOString().split('T')[0],
        today: new Date().toISOString().split('T')[0],
        members: ['me'],
        tags: [{ label: 'Important', color: 'purple' }],
        subtasks: []
    });

    const [newSubtask, setNewSubtask] = useState('');

    // The modal stays mounted, so useState's initialiser only ever runs once.
    // Re-seed the form whenever a different task is opened, otherwise the
    // previous task's values (and GitHub links) stick around.
    React.useEffect(() => {
        if (!isOpen) return;
        setTask(taskToEdit || {
            title: '',
            priority: 'Medium',
            status: 'Todo',
            date: new Date().toLocaleDateString(),
            deadline: new Date().toISOString().split('T')[0],
            today: new Date().toISOString().split('T')[0],
            members: ['me'],
            tags: [{ label: 'Important', color: 'purple' }],
            subtasks: []
        });
        setNewSubtask('');
    }, [isOpen, taskToEdit]);

    // Click the backdrop or press Escape to dismiss.
    const { backdropProps } = useModalDismiss(isOpen, onClose);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (taskToEdit && taskToEdit._id) {
            console.log('[TaskModal] Updating task:', taskToEdit._id, task);
            updateTask(taskToEdit._id, task);
        } else {
            console.log('[TaskModal] Adding new task to project:', activeProjectId, task);
            addTask({ ...task, projectId: activeProjectId });
        }
        onClose();
    };

    const addSubtask = () => {
        if (!newSubtask) return;
        setTask({
            ...task,
            subtasks: [...task.subtasks, { id: Date.now(), title: newSubtask, completed: false }]
        });
        setNewSubtask('');
    };

    return (
        <div
            {...backdropProps}
            role="presentation"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
            <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                    <FiX size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-8">
                    {taskToEdit ? 'Edit Task' : 'Create New Task'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Task Title</label>
                        <input
                            type="text"
                            required
                            disabled={!isAdmin}
                            className={`w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-cyan/50 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={task.title}
                            onChange={e => setTask({ ...task, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                            <select
                                disabled={!isAdmin}
                                className={`w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-cyan/50 appearance-none ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                value={task.priority}
                                onChange={e => setTask({ ...task, priority: e.target.value })}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
                            <select
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-cyan/50 appearance-none"
                                value={task.status}
                                onChange={e => setTask({ ...task, status: e.target.value })}
                            >
                                <option value="Todo">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Under Review</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Deadline</label>
                        <input
                            type="date"
                            required
                            disabled={!isAdmin}
                            className={`w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-cyan/50 [color-scheme:dark] ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={task.deadline}
                            min={task.today || new Date().toISOString().split('T')[0]}
                            onChange={e => setTask({ ...task, deadline: e.target.value })}
                        />
                    </div>

                    {/* Assigned To Dropdown */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assigned To</label>
                        <select
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-cyan/50 appearance-none"
                            value={task.members[0] || ''}
                            onChange={e => {
                                const val = e.target.value;
                                setTask({ ...task, members: [val] });
                            }}
                        >
                            <option value="">Unassigned</option>
                            <option value="me">Me ({userProfile?.name || 'User'})</option>
                            {activeProject?.team?.filter(member =>
                                member._id !== userProfile?.id &&
                                member.id !== 'me' &&
                                member.email !== userProfile?.email
                            ).map(member => (
                                <option key={member._id || member.id} value={member._id || member.id}>{member.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Subtasks</label>
                        {isAdmin && (
                            <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-1">
                                <input
                                    type="text"
                                    className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-cyan/50"
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    placeholder="Add a subtask..."
                                />
                                <button
                                    type="button"
                                    onClick={addSubtask}
                                    className="px-4 bg-neon-cyan text-midnight font-bold rounded-xl hover:shadow-[0_0_15px_#00F2EA] transition-all"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                        )}
                        <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                            {task.subtasks.map(s => (
                                <div key={s.id || s._id} className="flex items-center justify-between p-2 bg-slate-950/30 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSubtasks = task.subtasks.map(st =>
                                                    (st.id === s.id && st._id === s._id) ? { ...st, completed: !st.completed } : st
                                                );
                                                setTask({ ...task, subtasks: newSubtasks });
                                            }}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${s.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700'
                                                }`}
                                        >
                                            {s.completed && <FiCheckSquare size={14} />}
                                        </button>
                                        <span className={`text-xs ${s.completed ? 'text-slate-500 line-through' : 'text-slate-300'} truncate`}>
                                            {s.title}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => setTask({ ...task, subtasks: task.subtasks.filter(st => (st.id !== s.id || st._id !== s._id)) })}
                                            className="text-slate-600 hover:text-rose-500 ml-2"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* GitHub Smart Integration — only meaningful for saved tasks */}
                    {taskToEdit?._id && (
                        <div className="pt-2 border-t border-white/5">
                            <div className="pt-5">
                                <TaskGithubPanel task={taskToEdit} />
                            </div>
                        </div>
                    )}

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
                            {taskToEdit ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
