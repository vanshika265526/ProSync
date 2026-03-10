import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FiBriefcase, FiCheckCircle, FiClock, FiAlertCircle, FiCalendar } from 'react-icons/fi';

const colorMap = {
    blue: {
        darkBg: 'bg-blue-500/10',
        darkText: 'text-blue-400',
        lightBg: 'bg-blue-500',
        glow: 'bg-blue-500/10',
        hoverGlow: 'group-hover:bg-blue-500/20',
        progFrom: 'from-blue-500',
        progTo: 'to-blue-300',
        text: 'text-blue-500'
    },
    cyan: {
        darkBg: 'bg-cyan-500/10',
        darkText: 'text-cyan-400',
        lightBg: 'bg-cyan-500',
        glow: 'bg-cyan-500/10',
        hoverGlow: 'group-hover:bg-cyan-500/20',
        progFrom: 'from-cyan-500',
        progTo: 'to-cyan-300',
        text: 'text-cyan-500'
    },
    emerald: {
        darkBg: 'bg-emerald-500/10',
        darkText: 'text-emerald-400',
        lightBg: 'bg-emerald-500',
        glow: 'bg-emerald-500/10',
        hoverGlow: 'group-hover:bg-emerald-500/20',
        progFrom: 'from-emerald-500',
        progTo: 'to-emerald-300',
        text: 'text-emerald-500'
    },
    rose: {
        darkBg: 'bg-rose-500/10',
        darkText: 'text-rose-400',
        lightBg: 'bg-rose-500',
        glow: 'bg-rose-500/10',
        hoverGlow: 'group-hover:bg-rose-500/20',
        progFrom: 'from-rose-500',
        progTo: 'to-rose-300',
        text: 'text-rose-500'
    },
    amber: {
        darkBg: 'bg-amber-500/10',
        darkText: 'text-amber-400',
        lightBg: 'bg-amber-500',
        glow: 'bg-amber-500/10',
        hoverGlow: 'group-hover:bg-amber-500/20',
        progFrom: 'from-amber-500',
        progTo: 'to-amber-300',
        text: 'text-amber-500'
    }
};

const SummaryCard = ({ title, value, icon, color, progress }) => {
    const { theme } = useDashboard();
    const colors = colorMap[color] || colorMap.blue;

    return (
        <div className={`p-4 rounded-3xl transition-all group overflow-hidden relative ${theme === 'dark'
            ? 'bg-slate-900/40 border-white/5 hover:border-white/20 divide-white/5'
            : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300'
            } border`}>
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${colors.glow} blur-3xl rounded-full ${colors.hoverGlow} transition-all`}></div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className={`text-[9px] uppercase tracking-widest font-black mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                        }`}>{title}</p>
                    <h3 className={`text-xl font-black tracking-tight leading-none ${theme === 'dark' ? 'text-white' : 'text-black'
                        }`}>{value}</h3>
                </div>
                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${theme === 'dark'
                    ? `${colors.darkBg} ${colors.darkText} group-hover:bg-opacity-20`
                    : `${colors.lightBg} text-white shadow-[0_5px_15px_rgba(0,0,0,0.1)] group-hover:scale-110`
                    }`}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
            </div>

            {progress !== undefined && (
                <div className="mt-4 relative z-10">
                    <div className="flex justify-between text-[10px] items-center mb-1.5">
                        <span className={`font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Progress</span>
                        <span className={`${colors.text} font-black`}>{progress}%</span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                        }`}>
                        <div
                            className={`h-full bg-gradient-to-r ${colors.progFrom} ${colors.progTo} rounded-full transition-all duration-1000`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SummaryCards = () => {
    const { stats } = useDashboard();

    const completionRate = stats.globalProgress || 0;

    const cards = [
        { title: 'Projects', value: stats.totalProjects, icon: <FiBriefcase />, color: 'blue' },
        { title: 'Tasks', value: stats.totalTasks, icon: <FiCheckCircle />, color: 'cyan' },
        { title: 'Global Finished', value: stats.completedTasks, icon: <FiCheckCircle />, color: 'emerald', progress: completionRate },
        { title: 'Overdue', value: stats.overdueTasks, icon: <FiAlertCircle />, color: 'rose' },
        { title: 'Due Today', value: stats.tasksDueToday, icon: <FiCalendar />, color: 'amber' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {cards.map((card, idx) => (
                <SummaryCard key={idx} {...card} />
            ))}
        </div>
    );
};

export default SummaryCards;
