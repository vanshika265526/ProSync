<<<<<<< HEAD
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FiPlus, FiFolder, FiGrid, FiList, FiLayout, FiCalendar, FiSettings, FiFileText, FiSun, FiMoon, FiUsers, FiCheckSquare, FiGithub, FiClock } from "react-icons/fi";
import { useNavigate, Navigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { useCommandPalette } from "../context/CommandPaletteContext";
import { useActivity } from "../context/ActivityContext";
import { useGithub } from "../context/GithubContext";
=======
import React, { useState, useMemo, lazy, Suspense } from "react";
import { FiPlus, FiFolder, FiGrid, FiList, FiLayout, FiCalendar, FiSettings, FiFileText, FiSun, FiMoon, FiUsers, FiCheckSquare } from "react-icons/fi";
import { useNavigate, Navigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
import Sidebar from "../components/Sidebar";
import Board from "../components/Board";
import SummaryCards from "../components/SummaryCards";
import FilterBar from "../components/FilterBar";
import Notes from "./Notes";
import ListView from "../components/ListView";
import TaskModal from "../components/TaskModal";
import ProjectModal from "../components/ProjectModal";
import CalendarView from "../components/CalendarView";
import ProjectProgressBar from "../components/ProjectProgressBar";
import MembersView from "../components/MembersView";
<<<<<<< HEAD
import InviteModal from "../components/InviteModal";
import SettingsModal from "../components/SettingsModal";
import GithubDashboard from "../components/github/GithubDashboard";
import GithubWidget from "../components/github/GithubWidget";
import NotificationBell from "../components/notifications/NotificationBell";
import ActivityFeedButton from "../components/activity/ActivityFeedButton";
import CommandPaletteButton from "../components/command/CommandPaletteButton";
import HistoryTimeline from "../components/timeline/HistoryTimeline";

const TABS = [
    { id: 'My Tasks', icon: FiCheckSquare },
    { id: 'Board', icon: FiGrid },
    { id: 'List', icon: FiList },
    { id: 'Calendar', icon: FiCalendar },
    { id: 'Notes', icon: FiFileText },
    { id: 'Members', icon: FiUsers },
    { id: 'History', icon: FiClock },
    { id: 'GitHub', icon: FiGithub },
];
=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1

const Home = () => {
    const [activeTab, setActiveTab] = useState("Board");
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
<<<<<<< HEAD
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const {
        projects, tasks, activeProjectId, showGreeting, userProfile,
        theme, toggleTheme, currentUserRole, logout,
    } = useDashboard();
    const { registerActions } = useCommandPalette();
    const { openFeed } = useActivity();
    const github = useGithub();
    const navigate = useNavigate();

    //fetching the active projects-if none show a empty folder
    // Kept above the onboarding redirect so hooks always run in the same order.
    const activeProject = useMemo(() => {
        if (!activeProjectId) return projects[0] || null;
        return projects.find(p => p._id === activeProjectId) || projects[0] || null;
    }, [projects, activeProjectId]);

    const handleAddTask = useCallback((task = null) => {
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    }, []);

    /**
     * Wire the command palette to this page's controls.
     *
     * The palette lives above the router, so it can't reach modal state
     * directly — it calls these handlers by name instead. Registered in an
     * effect so the handlers are always the current closures.
     */
    useEffect(() => registerActions({
        'create-task': () => handleAddTask(),
        'create-project': () => setIsProjectModalOpen(true),
        'invite-member': () => setIsInviteModalOpen(true),
        'open-settings': () => setIsSettingsModalOpen(true),
        'open-activity': () => openFeed(),
        'set-tab': (tab) => { if (TABS.some(t => t.id === tab)) setActiveTab(tab); },
        'sync-repo': () => github.syncNow?.(),
        'connect-repo': () => setActiveTab('GitHub'),
        'logout': () => { logout(); navigate('/'); },
        // Jumping to a task from search: open it in the editor directly.
        'focus-task': (taskId) => {
            const task = tasks.find(t => t._id === taskId);
            if (task) handleAddTask(task);
        },
    }), [registerActions, handleAddTask, openFeed, github, logout, navigate, tasks]);
=======
    const { projects, activeProjectId, showGreeting, userProfile, theme, toggleTheme, currentUserRole } = useDashboard();
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1

    // Redirect if onboarding not complete
    if (userProfile && !userProfile.onboardingComplete && !localStorage.getItem('isDemoMode')) {
        return <Navigate to="/onboarding" />;
    }

<<<<<<< HEAD
=======
    const handleAddTask = (task = null) => {
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    };
    //fetching the active projects-if none show a empty folder
    const activeProject = useMemo(() => {
        if (!activeProjectId) return projects[0] || null;
        return projects.find(p => p._id === activeProjectId) || projects[0] || null;
    }, [projects, activeProjectId]);

>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
    if (projects.length === 0) {
        return (
            <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'} font-['Outfit'] overflow-hidden selection:bg-neon-cyan/30 transition-colors duration-300`}>
                <Sidebar onAddProject={() => setIsProjectModalOpen(true)} onAddTask={() => { }} />

                <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-purple/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-cyan/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

                    <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-slate-900/50 border border-white/10 rounded-3xl flex items-center justify-center text-neon-cyan mb-8 mx-auto shadow-2xl relative">
                            <FiFolder size={48} className="animate-pulse" />
                            <div className="absolute -inset-4 bg-neon-cyan/10 blur-2xl rounded-full -z-10"></div>
                        </div>

                        <h2 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'} mb-4 tracking-tight`}>No Projects Yet</h2>
                        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                            Ready to ship faster? Create your first project and start organizing your tasks with neon excellence.
                        </p>

<<<<<<< HEAD
                        {currentUserRole === 'Admin' && (
=======
                        {['Owner', 'Admin'].includes(currentUserRole) && (
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
                            <button
                                onClick={() => setIsProjectModalOpen(true)}
                                className="group relative px-8 py-4 bg-gradient-to-r from-electric-purple to-neon-cyan text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(125,0,255,0.3)] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative flex items-center gap-3">
                                    <FiPlus className="text-xl" /> Create Your First Project
                                </span>
                            </button>
                        )}
                    </div>
                </main>
                <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
            </div>
        );
    }

    return (
        <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'} font-['Outfit'] overflow-hidden selection:bg-neon-cyan/30 transition-colors duration-300`}>
            <Sidebar
                onAddProject={() => setIsProjectModalOpen(true)}
                onAddTask={() => setIsTaskModalOpen(true)}
                onViewMembers={() => setActiveTab('Members')}
                onViewList={() => setActiveTab('List')}
            />

            <main className={`flex-1 flex flex-col min-w-0 relative z-10 ${theme === 'dark' ? 'bg-[#020617]/50' : 'bg-slate-50/50'}`}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-purple/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-cyan/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

                {/* Header */}
<<<<<<< HEAD
                <header className="px-4 sm:px-8 pt-6 pb-2 flex items-center justify-between gap-3 flex-shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} border rounded-xl flex items-center justify-center text-neon-cyan shadow-xl`}>
                            <FiFolder size={20} />
                        </div>
                        <div className="min-w-0">
                            {showGreeting && (
                                <div className="text-[10px] text-neon-cyan font-black uppercase tracking-[0.2em] mb-0.5 animate-in fade-in slide-in-from-left-2 transition-all truncate">
=======
                <header className="px-8 pt-6 pb-2 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} border rounded-xl flex items-center justify-center text-neon-cyan shadow-xl`}>
                            <FiFolder size={20} />
                        </div>
                        <div>
                            {showGreeting && (
                                <div className="text-[10px] text-neon-cyan font-black uppercase tracking-[0.2em] mb-0.5 animate-in fade-in slide-in-from-left-2 transition-all">
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
                                    Welcome back, {userProfile?.name || 'User'}!
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">
                                <span>Project</span>
                                <span className="text-slate-700">/</span>
<<<<<<< HEAD
                                <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} font-bold truncate`}>{activeProject?.type || 'Private Board'}</span>
                            </div>
                            <h1 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-black'} tracking-tight truncate`}>
=======
                                <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} font-bold`}>{activeProject?.type || 'Private Board'}</span>
                            </div>
                            <h1 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-black'} tracking-tight`}>
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
                                {activeProject?.name || 'Select a Project'}
                            </h1>
                        </div>
                    </div>

<<<<<<< HEAD
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <CommandPaletteButton />
                        <ActivityFeedButton />
                        <NotificationBell />
                        <button
                            onClick={toggleTheme}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/50' : 'bg-white border-slate-200 text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/50'}`}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
                        </button>
                        {(currentUserRole === 'Admin') && (
                            <button
                                onClick={() => handleAddTask()}
                                className="hidden sm:flex h-9 px-3.5 bg-gradient-to-r from-electric-purple to-pink-600 text-white font-bold rounded-xl text-[11px] hover:shadow-[0_0_20px_rgba(125,0,255,0.4)] hover:-translate-y-0.5 transition-all items-center gap-1.5 border border-white/10 group whitespace-nowrap"
                            >
                                <FiPlus size={13} className="group-hover:rotate-90 transition-all" />
                                {/* Label drops below xl so the row never crowds
                                    the project title on smaller laptops. */}
                                <span className="hidden xl:inline">Create Task</span>
=======
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/50' : 'bg-white border-slate-200 text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/50'}`}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                        </button>
                        {(['Owner', 'Admin'].includes(currentUserRole)) && (
                            <button
                                onClick={() => handleAddTask()}
                                className="px-5 py-2.5 bg-gradient-to-r from-electric-purple to-pink-600 text-white font-bold rounded-xl text-xs hover:shadow-[0_0_20px_rgba(125,0,255,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-white/10 group"
                            >
                                <FiPlus className="group-hover:rotate-90 transition-all" /> <span>Create Task</span>
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
                            </button>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
<<<<<<< HEAD
                <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8 pt-3 pb-0">
=======
                <div className="flex-1 flex flex-col overflow-hidden px-8 pt-3 pb-0">
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
                    {/* Top Section: Stats & Navigation (Fixed) */}
                    <div className="flex-shrink-0">
                        <SummaryCards />
                        <ProjectProgressBar />

                        {/* Navigation Tabs & Filters */}
                        <div className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} mb-3 flex flex-wrap items-center justify-between`}>
<<<<<<< HEAD
                            <div
                                className="flex items-center gap-5 sm:gap-8 text-sm font-semibold overflow-x-auto no-scrollbar"
                                role="tablist"
                                aria-label="Project views"
                            >
                                {TABS.map(({ id, icon: Icon }) => (
                                    <button
                                        key={id}
                                        role="tab"
                                        aria-selected={activeTab === id}
                                        onClick={() => setActiveTab(id)}
                                        className={`py-2 relative transition-all flex items-center gap-2 uppercase tracking-widest text-[9px] font-black whitespace-nowrap ${activeTab === id
                                            ? 'text-neon-cyan'
                                            : theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-black'}`}
                                    >
                                        <Icon size={12} />
                                        {id}
                                        {activeTab === id && (
=======
                            <div className="flex items-center gap-8 text-sm font-semibold">
                                {['My Tasks', 'Board', 'List', 'Calendar', 'Notes', 'Members'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-2 relative transition-all flex items-center gap-2 uppercase tracking-widest text-[9px] font-black ${activeTab === tab
                                            ? 'text-neon-cyan'
                                            : theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-black'}`}
                                    >
                                        {tab === 'My Tasks' && <FiCheckSquare size={12} />}
                                        {tab === 'Board' && <FiGrid size={12} />}
                                        {tab === 'List' && <FiList size={12} />}
                                        {tab === 'Notes' && <FiFileText size={12} />}
                                        {tab === 'Members' && <FiUsers size={12} />}
                                        {tab}
                                        {activeTab === tab && (
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan shadow-[0_0_10px_#00F2EA]"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Widget */}
                        {['Board', 'List'].includes(activeTab) && <FilterBar />}
                    </div>

                    {/* Tab Content - Scrollable area */}
                    <div className={`flex-1 ${activeTab === 'Board' ? 'overflow-hidden' : 'overflow-y-auto'} custom-scrollbar mt-2 -mr-4 pr-4`}>
                        {activeTab === 'My Tasks' ? (
<<<<<<< HEAD
                            <div className="h-full space-y-5">
                                {/* GitHub Activity widget lives on the overview tab */}
                                <GithubWidget onOpenFull={() => setActiveTab('GitHub')} onConnect={() => setActiveTab('GitHub')} />
=======
                            <div className="h-full">
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
                                <ListView onEdit={handleAddTask} isMyTasksView={true} />
                            </div>
                        ) : activeTab === 'Board' ? <Board onAddTask={handleAddTask} /> :
                            activeTab === 'List' ? (
                                <div className="h-full">
                                    <ListView onEdit={handleAddTask} />
                                </div>
                            ) :
                                activeTab === 'Notes' ? <Notes /> :
                                    activeTab === 'Calendar' ? <CalendarView onEdit={handleAddTask} /> :
<<<<<<< HEAD
                                        activeTab === 'Members' ? <MembersView /> :
                                            activeTab === 'History' ? <HistoryTimeline /> :
                                                activeTab === 'GitHub' ? <GithubDashboard /> : (
                                                    <div className={`flex flex-col items-center justify-center h-[400px] border-2 border-dashed ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-100/50'} rounded-3xl`}>
                                                        <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-slate-900 text-slate-700' : 'bg-slate-200 text-slate-400'} rounded-2xl flex items-center justify-center mb-4`}>
                                                            <FiLayout size={32} />
                                                        </div>
                                                        <h3 className={`${theme === 'dark' ? 'text-white' : 'text-slate-800'} font-bold text-lg mb-1`}>{activeTab} View</h3>
                                                        <p className="text-slate-500 text-sm">Working on implementing this view with neon excellence.</p>
                                                    </div>
                                                )}
=======
                                        activeTab === 'Members' ? <MembersView /> : (
                                            <div className={`flex flex-col items-center justify-center h-[400px] border-2 border-dashed ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-100/50'} rounded-3xl`}>
                                                <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-slate-900 text-slate-700' : 'bg-slate-200 text-slate-400'} rounded-2xl flex items-center justify-center mb-4`}>
                                                    <FiLayout size={32} />
                                                </div>
                                                <h3 className={`${theme === 'dark' ? 'text-white' : 'text-slate-800'} font-bold text-lg mb-1`}>{activeTab} View</h3>
                                                <p className="text-slate-500 text-sm">Working on implementing this view with neon excellence.</p>
                                            </div>
                                        )}
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
                    </div>
                </div>
            </main>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setTaskToEdit(null);
                }}
                taskToEdit={taskToEdit}
            />
            <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
<<<<<<< HEAD
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                activeProjectId={activeProjectId}
                projectName={activeProject?.name}
            />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
        </div>
    );
};

export default Home;
