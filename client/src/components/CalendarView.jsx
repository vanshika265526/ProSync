<<<<<<< HEAD
import React, { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from 'react-icons/fi';
import { useDashboard } from '../context/DashboardContext';

const CalendarView = ({ onEdit }) => {
    const { filteredTasks, theme, userProfile, currentUserRole } = useDashboard();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'mine'

    //Generating the Calendar Grid BY OWN
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];

        // Pad start
        const firstDay = date.getDay();
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }

        return days;
    }, [currentDate]);

    const tasksByDate = useMemo(() => {
        const grouped = {};
        const tasksToDisplay = viewMode === 'mine'
            ? filteredTasks.filter(t => t.members?.includes('me') || t.members?.includes(userProfile?.id))
            : filteredTasks;

        tasksToDisplay.forEach(task => {
            const dateVal = task.deadline || task.date;
            if (dateVal) {
                try {
                    // Handle both Date objects and strings
                    const d = new Date(dateVal);
                    if (!isNaN(d.getTime())) {
                        const key = d.toISOString().split('T')[0];
                        if (!grouped[key]) grouped[key] = [];
                        grouped[key].push(task);
                    }
                } catch (e) {
                    console.error('Error parsing date for calendar:', dateVal);
                }
            }
        });
        return grouped;
    }, [filteredTasks, viewMode, userProfile]);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    return (
        <div className={`mr-6 ${theme === 'dark' ? 'bg-slate-950/40 border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-md'} rounded-3xl border overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-auto`}>
            {/* Calendar Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'} `}>
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} rounded-lg flex items-center justify-center text-neon-cyan shadow-lg border`}>
                        <FiCalendar size={16} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-black'} tracking-tight`}>{monthName} {year}</h2>
                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Project Schedule</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 p-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-slate-100 border-slate-200'} mr-2`}>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'all'
                                ? 'bg-neon-cyan text-midnight shadow-[0_0_10px_#00F2EA]'
                                : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            All Tasks
                        </button>
                        <button
                            onClick={() => setViewMode('mine')}
                            className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'mine'
                                ? 'bg-electric-purple text-white shadow-[0_0_10px_#7D00FF]'
                                : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            My Tasks
                        </button>
                    </div>

                    <button
                        onClick={prevMonth}
                        className={`p-1.5 rounded-lg border transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:border-neon-cyan/50' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-neon-cyan/50'}`}
                    >
                        <FiChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className={`px-3 py-1.5 rounded-lg border text-[8px] font-bold uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-neon-cyan' : 'bg-white border-slate-200 text-slate-500 hover:text-neon-cyan'}`}
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className={`p-1.5 rounded-lg border transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:border-neon-cyan/50' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-neon-cyan/50'}`}
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1">
                <div className={`grid grid-cols-7 border-b ${theme === 'dark' ? 'border-white/5 bg-slate-950/90' : 'border-slate-200 bg-white/90'} sticky top-0 backdrop-blur-md z-10`}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2.5 text-center text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[80px]">
                    {daysInMonth.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className={`border-b border-r ${theme === 'dark' ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/50'}`}></div>;

                        const dateStr = date.toISOString().split('T')[0];
                        const dayTasks = tasksByDate[dateStr] || [];
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                        return (
                            <div key={dateStr} className={`border-b border-r ${theme === 'dark' ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'} p-2 flex flex-col gap-1 transition-colors ${isToday ? (theme === 'dark' ? 'bg-neon-cyan/[0.02]' : 'bg-neon-cyan/[0.05]') : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-black ${isToday ? 'text-neon-cyan' : theme === 'dark' ? 'text-slate-500' : 'text-slate-700'}`}>
                                        {date.getDate()}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                                    {dayTasks.map(task => {
                                        const isMine = task.members?.includes('me') || task.members?.includes(userProfile?.id);
                                        return (
                                            <div
                                                key={task._id}
                                                onClick={() => currentUserRole === 'Admin' && onEdit(task)}
                                                className={`px-2 py-1.5 rounded-lg text-[9px] font-bold truncate ${currentUserRole === 'Admin' ? 'cursor-pointer' : ''} transition-all border ${isMine
                                                    ? 'bg-electric-purple/20 border-electric-purple/40 text-electric-purple shadow-[0_0_10px_rgba(125,0,255,0.1)] hover:bg-electric-purple/40'
                                                    : task.priority === 'High'
                                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                                        : task.priority === 'Medium'
                                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                    }`}
                                                title={task.title}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-1 h-1 rounded-full ${isMine ? 'bg-electric-purple shadow-[0_0_5px_#7D00FF]' : task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}></div>
                                                    {task.title}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
=======
import React, { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from 'react-icons/fi';
import { useDashboard } from '../context/DashboardContext';

const CalendarView = ({ onEdit }) => {
    const { filteredTasks, theme, userProfile, currentUserRole } = useDashboard();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'mine'

    //Generating the Calendar Grid BY OWN
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];

        // Pad start
        const firstDay = date.getDay();
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }

        return days;
    }, [currentDate]);

    const tasksByDate = useMemo(() => {
        const grouped = {};
        const tasksToDisplay = viewMode === 'mine'
            ? filteredTasks.filter(t => t.members?.includes('me') || t.members?.includes(userProfile?.id))
            : filteredTasks;

        tasksToDisplay.forEach(task => {
            const dateVal = task.deadline || task.date;
            if (dateVal) {
                try {
                    // Handle both Date objects and strings
                    const d = new Date(dateVal);
                    if (!isNaN(d.getTime())) {
                        const key = d.toISOString().split('T')[0];
                        if (!grouped[key]) grouped[key] = [];
                        grouped[key].push(task);
                    }
                } catch (e) {
                    console.error('Error parsing date for calendar:', dateVal);
                }
            }
        });
        return grouped;
    }, [filteredTasks, viewMode, userProfile]);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    return (
        <div className={`mr-6 ${theme === 'dark' ? 'bg-slate-950/40 border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-md'} rounded-3xl border overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-auto`}>
            {/* Calendar Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'} `}>
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} rounded-lg flex items-center justify-center text-neon-cyan shadow-lg border`}>
                        <FiCalendar size={16} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-black'} tracking-tight`}>{monthName} {year}</h2>
                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Project Schedule</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 p-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-slate-100 border-slate-200'} mr-2`}>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'all'
                                ? 'bg-neon-cyan text-midnight shadow-[0_0_10px_#00F2EA]'
                                : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            All Tasks
                        </button>
                        <button
                            onClick={() => setViewMode('mine')}
                            className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'mine'
                                ? 'bg-electric-purple text-white shadow-[0_0_10px_#7D00FF]'
                                : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            My Tasks
                        </button>
                    </div>

                    <button
                        onClick={prevMonth}
                        className={`p-1.5 rounded-lg border transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:border-neon-cyan/50' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-neon-cyan/50'}`}
                    >
                        <FiChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className={`px-3 py-1.5 rounded-lg border text-[8px] font-bold uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-neon-cyan' : 'bg-white border-slate-200 text-slate-500 hover:text-neon-cyan'}`}
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className={`p-1.5 rounded-lg border transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:border-neon-cyan/50' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-neon-cyan/50'}`}
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1">
                <div className={`grid grid-cols-7 border-b ${theme === 'dark' ? 'border-white/5 bg-slate-950/90' : 'border-slate-200 bg-white/90'} sticky top-0 backdrop-blur-md z-10`}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2.5 text-center text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[80px]">
                    {daysInMonth.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className={`border-b border-r ${theme === 'dark' ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/50'}`}></div>;

                        const dateStr = date.toISOString().split('T')[0];
                        const dayTasks = tasksByDate[dateStr] || [];
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                        return (
                            <div key={dateStr} className={`border-b border-r ${theme === 'dark' ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'} p-2 flex flex-col gap-1 transition-colors ${isToday ? (theme === 'dark' ? 'bg-neon-cyan/[0.02]' : 'bg-neon-cyan/[0.05]') : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-black ${isToday ? 'text-neon-cyan' : theme === 'dark' ? 'text-slate-500' : 'text-slate-700'}`}>
                                        {date.getDate()}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                                    {dayTasks.map(task => {
                                        const isMine = task.members?.includes('me') || task.members?.includes(userProfile?.id);
                                        return (
                                            <div
                                                key={task._id}
                                                onClick={() => ['Owner', 'Admin'].includes(currentUserRole) && onEdit(task)}
                                                className={`px-2 py-1.5 rounded-lg text-[9px] font-bold truncate ${['Owner', 'Admin'].includes(currentUserRole) ? 'cursor-pointer' : ''} transition-all border ${isMine
                                                    ? 'bg-electric-purple/20 border-electric-purple/40 text-electric-purple shadow-[0_0_10px_rgba(125,0,255,0.1)] hover:bg-electric-purple/40'
                                                    : task.priority === 'High'
                                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                                        : task.priority === 'Medium'
                                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                    }`}
                                                title={task.title}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-1 h-1 rounded-full ${isMine ? 'bg-electric-purple shadow-[0_0_5px_#7D00FF]' : task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}></div>
                                                    {task.title}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
