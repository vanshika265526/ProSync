import React, { useState } from "react";
import {
    FiHome, FiFileText, FiSettings, FiPlus, FiChevronDown, FiChevronRight,
    FiTrash2, FiUsers, FiCheckSquare, FiLogOut, FiHelpCircle, FiChevronLeft
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SettingsModal from "./SettingsModal";
import InviteModal from "./InviteModal";
import authService from "../services/authService";

const Sidebar = ({ onAddProject, onAddTask, onViewMembers, onViewList }) => {
    const {
        projects, activeProjectId, setActiveProjectId,
        userProfile, deleteProject, isSidebarCollapsed, setIsSidebarCollapsed,
        theme, logout, currentUserRole
    } = useDashboard();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedProject, setExpandedProject] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const menuItems = [
        { icon: <FiHome />, label: "Home", path: "/" },
        { icon: <FiFileText />, label: "Docs", path: "/dashboard/docs" },
        { icon: <FiHelpCircle />, label: "Help & Support", path: "/support" },
        { icon: <FiSettings />, label: "Settings", onClick: () => setIsSettingsOpen(true) },
    ];

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const projectGradients = [
        "from-neon-cyan to-electric-purple shadow-[0_0_15px_rgba(0,242,234,0.3)]",
        "from-electric-purple to-pink-500 shadow-[0_0_15px_rgba(125,0,255,0.3)]",
        "from-pink-500 to-rose-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]",
        "from-emerald-400 to-neon-cyan shadow-[0_0_15px_rgba(52,211,153,0.3)]",
        "from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
    ];

    const handleLogout = (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to sign out?")) {
            logout();
            navigate('/');
        }
    };

    return (
        <aside className={`${isSidebarCollapsed ? 'w-[68px]' : 'w-56'} ${theme === 'dark' ? 'bg-slate-950 border-white/5 text-slate-400' : 'bg-white border-slate-200 text-slate-900'} border-r flex flex-col h-screen font-['Outfit'] font-light relative z-50 shadow-2xl transition-[width,background-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`absolute -right-3 top-10 w-6 h-6 ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border rounded-full flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(0,242,234,0.2)] hover:scale-110 transition-all z-[60] font-bold text-xs`}
            >
                {isSidebarCollapsed ? '>' : '<'}
            </button>
            {/* Logo Section */}
            <div className={`p-5 pb-4 flex items-center ${isSidebarCollapsed ? 'justify-center px-3' : 'gap-3'}`}>
                <div className="w-8 h-8 bg-electric-purple rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-purple-glow">
                    <span className="text-lg font-black ">PS</span>
                </div>
                {!isSidebarCollapsed && (
                    <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                        <h2 className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} tracking-tighter leading-none`}>ProSync</h2>
                        <span className="text-[8px] font-bold text-neon-cyan/60 tracking-[0.2em] uppercase">ENTERPRISE</span>
                    </div>
                )}
            </div>
            {/* Main Menu */}
            <div className="px-3 mb-4">
                {!isSidebarCollapsed && <h4 className={`text-[8px] font-black ${theme === 'dark' ? 'text-slate-600' : 'text-slate-900'} uppercase tracking-[0.2em] mb-2 px-4 animate-in fade-in`}>Main Menu</h4>}
                <div className="space-y-0.5">
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            onClick={item.onClick || (() => navigate(item.path))}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all group ${location.pathname === item.path
                                ? 'bg-white/5 text-neon-cyan border-l-2 border-neon-cyan active:bg-white/10'
                                : theme === 'dark' ? 'hover:bg-white/5 hover:text-slate-200' : 'hover:bg-slate-100 hover:text-slate-900'
                                } ${isSidebarCollapsed ? 'justify-center border-l-0 px-2' : ''}`}
                            title={isSidebarCollapsed ? item.label : ''}
                        >
                            <span className="text-base flex-shrink-0">{item.icon}</span>
                            {!isSidebarCollapsed && <span className="text-[11.5px] font-medium animate-in fade-in slide-in-from-left-1 duration-200">{item.label}</span>}
                        </div>
                    ))}
                </div>
            </div>
            {/* Projects Section */}
            <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center mb-4' : 'justify-between mb-2 px-4'}`}>
                    {!isSidebarCollapsed && <h4 className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] animate-in fade-in">Projects</h4>}
                    {currentUserRole === 'Admin' && (
                        <button
                            onClick={onAddProject}
                            className="p-1 bg-neon-cyan/10 text-neon-cyan rounded-md hover:bg-neon-cyan hover:text-midnight transition-all flex-shrink-0"
                        >
                            <FiPlus size={12} />
                        </button>
                    )}
                </div>
                <div className="space-y-0.5">
                    {projects.map(project => (
                        <div key={project._id} className="group/project">
                            <div
                                onClick={() => {
                                    setActiveProjectId(project._id);
                                    if (isSidebarCollapsed) {
                                        if (location.pathname !== '/dashboard') navigate('/dashboard');
                                        return;
                                    }
                                    setExpandedProject(expandedProject === project._id ? null : project._id);
                                    if (location.pathname !== '/dashboard') navigate('/dashboard');
                                }}
                                className={`flex items-center justify-between px-2 py-1.5 rounded-xl cursor-pointer transition-all mb-0.5 group/item ${activeProjectId === project._id
                                    ? theme === 'dark' ? 'bg-white/5 border border-white/10 shadow-lg' : 'bg-slate-100 border border-slate-200 shadow-sm'
                                    : 'hover:bg-white/5'
                                    } ${isSidebarCollapsed ? 'justify-center px-1' : ''}`}
                                title={isSidebarCollapsed ? project.name : ''}
                            >
                                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 min-w-0'}`}>
                                    <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${projectGradients[projects.indexOf(project) % projectGradients.length]} flex items-center justify-center text-[7px] font-black text-white shadow-lg transition-all duration-300 group-hover/project:scale-110 group-hover/project:rotate-3 ${activeProjectId === project._id ? 'scale-110 ring-1 ring-white/10' : 'opacity-80'}`}>
                                        {getInitials(project.name)}
                                    </div>
                                    {!isSidebarCollapsed && (
                                        <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                            <span className={`text-[9.5px] font-black truncate max-w-[85px] ${activeProjectId === project._id
                                                ? (theme === 'dark' ? 'text-white' : 'text-slate-900')
                                                : (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')
                                                }`}>
                                                {project.name}
                                            </span>
                                            <span className={`text-[6.5px] font-bold uppercase tracking-widest ${project.status === 'Active'
                                                ? (theme === 'dark' ? 'text-neon-cyan' : 'text-neon-cyan/80')
                                                : (theme === 'dark' ? 'text-slate-600' : 'text-slate-400')
                                                }`}>
                                                {project.status === 'Active' ? 'Live' : project.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {!isSidebarCollapsed && (
                                    <div className={`transition-transform duration-300 ${expandedProject === project._id ? 'rotate-180 text-neon-cyan' : 'text-slate-600'}`}>
                                        <FiChevronDown size={12} />
                                    </div>
                                )}
                            </div>

                            {/* Sub-menu */}
                            {!isSidebarCollapsed && expandedProject === project._id && (
                                <div className="ml-8 mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                                    {(project.user === userProfile?.id || currentUserRole === 'Admin') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddTask();
                                            }}
                                            className="w-full flex items-center justify-start gap-2 text-[10px] py-1 hover:text-neon-cyan transition-colors"
                                        >
                                            <FiPlus size={10} /> Add Task
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewList?.();
                                        }}
                                        className="w-full flex items-center justify-start gap-2 text-[10px] py-1 hover:text-neon-cyan transition-colors"
                                    >
                                        <FiCheckSquare size={10} /> List Tasks
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveProjectId(project._id);
                                            onViewMembers?.();
                                        }}
                                        className="w-full flex items-center justify-start gap-2 text-[10px] py-1 hover:text-neon-cyan transition-colors"
                                    >
                                        <FiUsers size={10} /> Team ({project.team.length})
                                    </button>
                                    {project.user === userProfile?.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteProject(project._id);
                                            }}
                                            className="w-full flex items-center justify-start gap-2 text-[10px] py-1 text-rose-500/60 hover:text-rose-500 transition-colors"
                                        >
                                            <FiTrash2 size={10} /> Delete Project
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {projects.length === 0 && !isSidebarCollapsed && (
                        <div className={`px-4 py-8 text-center border border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} rounded-xl mx-2 mt-2`}>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">No projects yet</p>
                        </div>
                    )}
                </div>

                {currentUserRole === 'Admin' && (
                    <div className={`mt-4 mb-4 ${isSidebarCollapsed ? 'px-1' : 'px-2'}`}>
                        <button
                            onClick={() => setIsInviteOpen(true)}
                            className={`w-full py-2.5 rounded-xl ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-slate-100 border-slate-200'} border text-neon-cyan text-[10px] font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-midnight transition-all group flex items-center justify-center gap-2`}
                            title={isSidebarCollapsed ? 'Invite Friends' : ''}
                        >
                            <FiUsers size={14} className="group-hover:scale-110 transition-transform" />
                            {!isSidebarCollapsed && <span className="animate-in fade-in">Invite Friends</span>}
                        </button>
                    </div>
                )}
            </div>
            {/* Profile Widget */}
            <div className={`p-3 border-t ${theme === 'dark' ? 'border-white/5 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-xl ${isSidebarCollapsed ? 'px-2' : ''}`}>
                <div
                    onClick={() => navigate('/profile')}
                    className={`flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group ${isSidebarCollapsed ? 'justify-center px-1' : ''}`}
                >
                    <div className="relative flex-shrink-0">
                        <img
                            src={userProfile?.avatar || 'https://i.pravatar.cc/150?img=26'}
                            className="w-8 h-8 rounded-lg border border-white/10 group-hover:border-neon-cyan/50 transition-all"
                            alt="Profile"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-slate-950 rounded-full"></div>
                    </div>
                    {!isSidebarCollapsed && (
                        <>
                            <div className="flex-1 min-w-0 animate-in fade-in">
                                <h4 className={`text-[10px] font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} truncate`}>
                                    {userProfile?.name || 'User'}
                                </h4>
                                <p className="text-[8px] text-slate-500 font-medium truncate">
                                    {userProfile?.title || currentUserRole}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-slate-600 hover:text-rose-500 transition-colors flex-shrink-0 p-1"
                                title="Sign Out"
                            >
                                <FiLogOut size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <InviteModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                activeProjectId={activeProjectId}
                projectName={projects.find(p => p._id === activeProjectId)?.name}
            />
        </aside>
    );
};

export default Sidebar;
