import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FiTrendingUp } from 'react-icons/fi';

const ProjectProgressBar = () => {
    const { stats, theme } = useDashboard();
    const progress = stats.projectProgress || 0;
    const projectName = stats.activeProjectName;

    return (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-neon-cyan/10 text-neon-cyan shadow-[0_0_10px_rgba(0,242,234,0.1)]">
                        <FiTrendingUp size={12} />
                    </div>
                    <div>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Active Project Progress</h4>
                        <h2 className={`text-xs font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{projectName}</h2>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-lg font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{progress}%</span>
                    <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${theme === 'dark' ? 'text-neon-cyan/60' : 'text-neon-cyan/80'}`}>Completion</p>
                </div>
            </div>

            <div className={`relative h-2 w-full rounded-full overflow-hidden border shadow-inner ${theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-slate-100 border-slate-200'
                }`}>
                {/* Progress Fill */}
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-electric-purple via-neon-cyan to-electric-purple bg-[length:200%_100%] animate-gradient-x transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(0,242,234,0.3)]"
                    style={{ width: `${progress}%` }}
                >
                    {/* Gloss Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>

                {/* Subtle Grid Pattern on Track */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '20px 100%' }}></div>
            </div>
        </div>
    );
};

export default ProjectProgressBar;
