<<<<<<< HEAD
import React, { useMemo } from "react";
import { FiPlus, FiMoreHorizontal } from "react-icons/fi";
import { useDashboard } from "../context/DashboardContext";
import TaskCard from "./TaskCard";

const Board = ({ onAddTask }) => {
    const { filteredTasks, theme, currentUserRole } = useDashboard();
    const columns = useMemo(() => [
        { title: "To Do", key: "Todo", color: "neon-cyan" },
        { title: "In Progress", key: "In Progress", color: "electric-purple" },
        { title: "Under Review", key: "Review", color: "pink-500" },
        { title: "Done", key: "Done", color: "emerald-400" },
    ], []);
    const tasksByStatus = useMemo(() => {
        const grouped = {
            'Todo': [],
            'In Progress': [],
            'Review': [],
            'Done': []
        };
        filteredTasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            } else {
                // Fallback for custom statuses or misspellings
                if (!grouped['Todo']) grouped['Todo'] = [];
                grouped['Todo'].push(task);
            }
        });
        return grouped;
    }, [filteredTasks]);

    return (
        <div className="w-full h-full overflow-x-auto flex gap-4 custom-scrollbar">
            {columns.map((col, idx) => {
                const columnTasks = tasksByStatus[col.key] || [];
                return (
                    <div key={col.key} className="flex-shrink-0 w-[280px] group/column">
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-transparent z-10 py-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-6 rounded-full ${col.key === 'Todo' ? 'bg-neon-cyan shadow-[0_0_10px_#00F2EA]' :
                                    col.key === 'In Progress' ? 'bg-electric-purple shadow-[0_0_10px_#7D00FF]' :
                                        col.key === 'Review' ? 'bg-pink-500 shadow-[0_0_10px_#EC4899]' :
                                            'bg-emerald-400 shadow-[0_0_10px_#34D399]'
                                    }`}></div>
                                <h3 className={`font-black ${theme === 'dark' ? 'text-white' : 'text-black'} text-[11px] uppercase tracking-[0.2em]`}>{col.title}</h3>
                                <span className={`${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-500' : 'bg-white border-slate-300 text-black'} text-[8px] font-black px-1.5 py-0.5 rounded-lg border`}>
                                    {columnTasks.length}
                                </span>
                            </div>
                            {col.key === 'Done' && (
                                <button className={`p-1.5 rounded-lg text-slate-600 ${theme === 'dark' ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-200'} transition-all`}>
                                    <FiMoreHorizontal />
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {columnTasks.map((task) => (
                                <TaskCard
                                    key={task._id}
                                    {...task}
                                    status={col.key}
                                    onEdit={() => onAddTask(task)}
                                />
                            ))}
                            {currentUserRole === 'Admin' && (
                                <button
                                    onClick={() => onAddTask()}
                                    className={`w-full py-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300 hover:bg-white/[0.02]' : 'border-slate-300 text-slate-500 hover:border-neon-cyan/50 hover:text-neon-cyan bg-white hover:bg-slate-50/50 shadow-sm'} transition-all group/add`}
                                >
                                    <div className="p-1 rounded-lg group-hover/add:bg-neon-cyan/20 group-hover/add:text-neon-cyan transition-all">
                                        <FiPlus />
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? '' : 'text-slate-600'}`}>Add New Task</span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            {currentUserRole === 'Admin' && (
                <div className="flex-shrink-0 w-[280px] flex flex-col pt-2">
                    <button className={`w-full py-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-white/5 text-slate-500 hover:border-neon-cyan/30 hover:text-neon-cyan hover:bg-neon-cyan/5' : 'border-slate-300 text-slate-600 hover:border-neon-cyan/50 hover:text-neon-cyan hover:bg-white shadow-sm'} transition-all group`}>
                        <FiPlus className="group-hover:rotate-90 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Add New Column</span>
                    </button>
                </div>
            )}
        </div>
    );
};
export default Board;
=======
import React, { useMemo } from "react";
import { FiPlus, FiMoreHorizontal } from "react-icons/fi";
import { useDashboard } from "../context/DashboardContext";
import TaskCard from "./TaskCard";

const Board = ({ onAddTask }) => {
    const { filteredTasks, theme, currentUserRole } = useDashboard();
    const columns = useMemo(() => [
        { title: "To Do", key: "Todo", color: "neon-cyan" },
        { title: "In Progress", key: "In Progress", color: "electric-purple" },
        { title: "Under Review", key: "Review", color: "pink-500" },
        { title: "Done", key: "Done", color: "emerald-400" },
    ], []);
    const tasksByStatus = useMemo(() => {
        const grouped = {
            'Todo': [],
            'In Progress': [],
            'Review': [],
            'Done': []
        };
        filteredTasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            } else {
                // Fallback for custom statuses or misspellings
                if (!grouped['Todo']) grouped['Todo'] = [];
                grouped['Todo'].push(task);
            }
        });
        return grouped;
    }, [filteredTasks]);

    return (
        <div className="w-full h-full overflow-x-auto flex gap-4 custom-scrollbar">
            {columns.map((col, idx) => {
                const columnTasks = tasksByStatus[col.key] || [];
                return (
                    <div key={col.key} className="flex-shrink-0 w-[280px] group/column">
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-transparent z-10 py-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-6 rounded-full ${col.key === 'Todo' ? 'bg-neon-cyan shadow-[0_0_10px_#00F2EA]' :
                                    col.key === 'In Progress' ? 'bg-electric-purple shadow-[0_0_10px_#7D00FF]' :
                                        col.key === 'Review' ? 'bg-pink-500 shadow-[0_0_10px_#EC4899]' :
                                            'bg-emerald-400 shadow-[0_0_10px_#34D399]'
                                    }`}></div>
                                <h3 className={`font-black ${theme === 'dark' ? 'text-white' : 'text-black'} text-[11px] uppercase tracking-[0.2em]`}>{col.title}</h3>
                                <span className={`${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-500' : 'bg-white border-slate-300 text-black'} text-[8px] font-black px-1.5 py-0.5 rounded-lg border`}>
                                    {columnTasks.length}
                                </span>
                            </div>
                            {col.key === 'Done' && (
                                <button className={`p-1.5 rounded-lg text-slate-600 ${theme === 'dark' ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-200'} transition-all`}>
                                    <FiMoreHorizontal />
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {columnTasks.map((task) => (
                                <TaskCard
                                    key={task._id}
                                    {...task}
                                    status={col.key}
                                    onEdit={() => onAddTask(task)}
                                />
                            ))}
                            {['Owner', 'Admin'].includes(currentUserRole) && (
                                <button
                                    onClick={() => onAddTask()}
                                    className={`w-full py-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300 hover:bg-white/[0.02]' : 'border-slate-300 text-slate-500 hover:border-neon-cyan/50 hover:text-neon-cyan bg-white hover:bg-slate-50/50 shadow-sm'} transition-all group/add`}
                                >
                                    <div className="p-1 rounded-lg group-hover/add:bg-neon-cyan/20 group-hover/add:text-neon-cyan transition-all">
                                        <FiPlus />
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? '' : 'text-slate-600'}`}>Add New Task</span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            {['Owner', 'Admin'].includes(currentUserRole) && (
                <div className="flex-shrink-0 w-[280px] flex flex-col pt-2">
                    <button className={`w-full py-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-white/5 text-slate-500 hover:border-neon-cyan/30 hover:text-neon-cyan hover:bg-neon-cyan/5' : 'border-slate-300 text-slate-600 hover:border-neon-cyan/50 hover:text-neon-cyan hover:bg-white shadow-sm'} transition-all group`}>
                        <FiPlus className="group-hover:rotate-90 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Add New Column</span>
                    </button>
                </div>
            )}
        </div>
    );
};
export default Board;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
