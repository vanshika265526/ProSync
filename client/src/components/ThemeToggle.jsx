import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useDashboard } from "../context/DashboardContext";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useDashboard();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
        >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>
    );
};

export default ThemeToggle;
