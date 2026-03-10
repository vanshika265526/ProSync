import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FiSearch, FiFilter, FiUser, FiChevronDown } from 'react-icons/fi';

const FilterBar = () => {
    const { filters, setFilters, theme } = useDashboard();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative group max-w-md w-full">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-cyan transition-colors" />
                <input
                    type="text"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleChange}
                    placeholder="Search tasks, descriptions..."
                    className={`w-full border rounded-xl py-2 pl-12 pr-4 text-xs focus:outline-none transition-all ${theme === 'dark'
                        ? 'bg-slate-900/50 border-white/10 text-slate-300 focus:border-neon-cyan/50 focus:ring-neon-cyan/20'
                        : 'bg-white border-slate-200 text-black focus:border-neon-cyan/50 shadow-sm'
                        }`}
                />
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                    <FiFilter className="absolute left-3 text-slate-500 pointer-events-none" />
                    <select
                        name="priority"
                        value={filters.priority}
                        onChange={handleChange}
                        className={`border rounded-lg py-1.5 pl-9 pr-8 text-xs focus:outline-none appearance-none cursor-pointer transition-all ${theme === 'dark'
                            ? 'bg-slate-900/50 border-white/10 text-slate-300 focus:border-neon-cyan/30'
                            : 'bg-white border-slate-200 text-black font-semibold focus:border-neon-cyan/30 shadow-sm'
                            }`}
                    >
                        <option value="All">All Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <FiChevronDown className="absolute right-2 text-slate-500 pointer-events-none" />
                </div>

                <div className="relative flex items-center">
                    <FiUser className="absolute left-3 text-slate-500 pointer-events-none" />
                    <select
                        name="assignee"
                        value={filters.assignee}
                        onChange={handleChange}
                        className={`border rounded-lg py-1.5 pl-9 pr-8 text-xs focus:outline-none appearance-none cursor-pointer transition-all ${theme === 'dark'
                            ? 'bg-slate-900/50 border-white/10 text-slate-300 focus:border-neon-cyan/30'
                            : 'bg-white border-slate-200 text-black font-semibold focus:border-neon-cyan/30 shadow-sm'
                            }`}
                    >
                        <option value="All">All Members</option>
                        {/* More options could be mapped here */}
                    </select>
                    <FiChevronDown className="absolute right-2 text-slate-500 pointer-events-none" />
                </div>

            </div>
        </div>
    );
};

export default FilterBar;
