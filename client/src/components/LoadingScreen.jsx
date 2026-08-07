<<<<<<< HEAD
import React from 'react';
import { useDashboard } from '../context/DashboardContext';

const LoadingScreen = ({ theme: propTheme }) => {
    // Try to get theme from context, fallback to prop or 'dark'
    let theme = propTheme;
    try {
        const context = useDashboard();
        if (context && context.theme) {
            theme = context.theme;
        }
    } catch (e) {
        // Context might not be available if used outside provider (e.g. error boundary)
        theme = propTheme || 'dark';
    }

    // If still undefined, default to dark
    if (!theme) theme = 'dark';

    return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center z-[100] transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-white'
            }`}>
            <div className="relative w-24 h-24">
                <div className={`absolute inset-0 border-4 rounded-full ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                    }`}></div>
                <div className="absolute inset-0 border-4 border-t-neon-cyan border-r-electric-purple rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,234,0.3)]"></div>
            </div>
            <h2 className="mt-8 text-xl font-black animate-pulse tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-electric-purple">
                Loading
            </h2>
            <div className={`mt-2 text-[10px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'
                }`}>
                Please Wait
            </div>
        </div>
    );
};

export default LoadingScreen;
=======
import React from 'react';
import { useDashboard } from '../context/DashboardContext';

const LoadingScreen = ({ theme: propTheme }) => {
    // Try to get theme from context, fallback to prop or 'dark'
    let theme = propTheme;
    try {
        const context = useDashboard();
        if (context && context.theme) {
            theme = context.theme;
        }
    } catch (e) {
        // Context might not be available if used outside provider (e.g. error boundary)
        theme = propTheme || 'dark';
    }

    // If still undefined, default to dark
    if (!theme) theme = 'dark';

    return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center z-[100] transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-white'
            }`}>
            <div className="relative w-24 h-24">
                <div className={`absolute inset-0 border-4 rounded-full ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                    }`}></div>
                <div className="absolute inset-0 border-4 border-t-neon-cyan border-r-electric-purple rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,234,0.3)]"></div>
            </div>
            <h2 className="mt-8 text-xl font-black animate-pulse tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-electric-purple">
                Loading
            </h2>
            <div className={`mt-2 text-[10px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'
                }`}>
                Please Wait
            </div>
        </div>
    );
};

export default LoadingScreen;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
