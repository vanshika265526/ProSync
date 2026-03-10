import React from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { useDashboard } from '../context/DashboardContext';

const SettingsModal = ({ isOpen, onClose }) => {
    const { showGreeting, setShowGreeting, theme, toggleTheme } = useDashboard();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-white/10 shadow-purple-glow/20' : 'bg-white border-slate-200 shadow-xl'} border w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 transition-all`}>
                <button onClick={onClose} className={`absolute top-6 right-6 ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-rose-500'} transition-colors`}>
                    <FiX size={24} />
                </button>

                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-8 flex items-center gap-3`}>
                    <div className="w-2 h-8 bg-neon-cyan rounded-full shadow-[0_0_10px_#00F2EA]"></div>
                    Settings
                </h2>

                <div className="space-y-6">
                    <div className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm'} border rounded-2xl transition-all`}>
                        <div>
                            <h4 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold text-sm mb-1`}>Dashboard Greeting</h4>
                            <p className="text-xs text-slate-500">Show welcome message on home</p>
                        </div>
                        <button
                            onClick={() => setShowGreeting(!showGreeting)}
                            className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${showGreeting ? 'bg-neon-cyan/20' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full transition-all ${showGreeting ? 'translate-x-6 bg-neon-cyan shadow-[0_0_10px_#00F2EA]' : 'translate-x-0 bg-slate-400'}`}></div>
                        </button>
                    </div>

                    <div className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm'} border rounded-2xl transition-all`}>
                        <div>
                            <h4 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold text-sm mb-1`}>Dark Mode</h4>
                            <p className="text-xs text-slate-500">Toggle system aesthetics</p>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="w-12 h-6 rounded-full bg-neon-cyan/20 flex items-center px-1 relative cursor-pointer"
                        >
                            <div className={`w-4 h-4 rounded-full transition-all ${theme === 'dark' ? 'translate-x-6 bg-neon-cyan shadow-[0_0_10px_#00F2EA]' : 'translate-x-0 bg-slate-400 shadow-none'}`}></div>
                        </button>
                    </div>

                    <div className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100'} border rounded-2xl opacity-50`}>
                        <div>
                            <h4 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold text-sm mb-1`}>Notifications</h4>
                            <p className="text-xs text-slate-500">Get alerts for overdue tasks</p>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-slate-700 flex items-center px-1">
                            <div className="w-4 h-4 rounded-full translate-x-0 bg-slate-500"></div>
                        </div>
                    </div>
                </div>

                <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-neon-cyan text-midnight font-bold rounded-xl text-xs uppercase tracking-widest hover:shadow-[0_0_20px_#00F2EA] transition-all flex items-center justify-center gap-2"
                    >
                        <FiCheck /> Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
