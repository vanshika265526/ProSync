import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import noteService from '../services/noteService';
const DashboardContext = createContext();

const DEMO_DATA = {
    user: {
        _id: 'demo_user_123',
        name: 'Guest Explorer',
        email: 'demo@prosync.io',
        token: 'demo_token'
    },
    projects: [
        {
            _id: 'demo_proj_1',
            name: 'Neo-Tokyo App',
            description: 'A futuristic city management application prototype.',
            status: 'In Progress',
            team: [
                { id: 'demo_user_123', name: 'Guest Explorer', role: 'Owner', avatar: 'https://ui-avatars.com/api/?name=Guest+Explorer&background=7D00FF&color=fff' },
                { id: 'user_2', name: 'Elena Fisher', role: 'Member', avatar: 'https://i.pravatar.cc/150?img=32' }
            ]
        }
    ],
    tasks: [
        {
            _id: 'demo_task_1',
            projectId: 'demo_proj_1',
            title: 'Refactor authentication flow',
            description: 'Improve security and speed of the login process.',
            status: 'In Progress',
            priority: 'High',
            deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            members: ['demo_user_123', 'user_2'],
            subtasks: [
                { id: 'st1', title: 'Update JWT strategy', completed: true },
                { id: 'st2', title: 'Implement MFA', completed: false }
            ]
        },
        {
            _id: 'demo_task_2',
            projectId: 'demo_proj_1',
            title: 'Design System Update',
            description: 'Apply Midnight Neon theme components.',
            status: 'Todo',
            priority: 'Medium',
            deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            members: ['demo_user_123'],
            subtasks: []
        },
        {
            _id: 'demo_task_3',
            projectId: 'demo_proj_1',
            title: 'Fix Navigation Bug',
            description: 'Header overflow on mobile devices.',
            status: 'Done',
            priority: 'Low',
            deadline: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            members: ['user_2'],
            subtasks: []
        }
    ],
    notes: [
        { _id: 'demo_note_1', title: 'Ideas for v2', content: 'Incorporate AI roadmap generation.', date: new Date().toISOString() }
    ]
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

export const DashboardProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('user');
        if (saved) return JSON.parse(saved);

        const isDemo = localStorage.getItem('isDemoMode') === 'true';
        if (isDemo) return DEMO_DATA.user;

        return null;
    });

    const location = useLocation();
    const navigate = useNavigate();

    const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('isDemoMode') === 'true');
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [showGreeting, setShowGreeting] = useState(true);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('user');
        if (saved) {
            const user = JSON.parse(saved);
            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'Member',
                avatar: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=7D00FF&color=fff`,
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            };
        }

        const isDemo = localStorage.getItem('isDemoMode') === 'true';
        if (isDemo) {
            return {
                id: DEMO_DATA.user._id,
                name: DEMO_DATA.user.name,
                email: DEMO_DATA.user.email,
                role: 'Demo User',
                avatar: `https://ui-avatars.com/api/?name=Guest+Explorer&background=7D00FF&color=fff`,
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            };
        }

        return null;
    });
    const [filters, setFilters] = useState({
        priority: 'All',
        status: 'All',
        assignee: 'All',
        keyword: ''
    });

    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (user) => {
        if (!user) return;
        setLoading(true);

        if (isDemoMode) {
            setProjects(DEMO_DATA.projects);
            setTasks(DEMO_DATA.tasks);
            setNotes(DEMO_DATA.notes);
            setActiveProjectId(DEMO_DATA.projects[0]._id);
            setLoading(false);
            return;
        }

        if (!user.token) return;

        try {
            const fetchedProjects = await projectService.getProjects(user.token);
            setProjects(fetchedProjects);

            let currentActiveId = activeProjectId;

            if (fetchedProjects.length > 0) {
                const lastProjectId = localStorage.getItem(`${user._id}_activeProjectId`);
                currentActiveId = (lastProjectId && fetchedProjects.find(p => p._id === lastProjectId))?._id || fetchedProjects[0]._id;
                setActiveProjectId(currentActiveId);

                const fetchedTasks = await taskService.getTasks(currentActiveId, user.token);
                setTasks(fetchedTasks);
            }

            const fetchedNotes = await noteService.getNotes(user.token);
            setNotes(fetchedNotes);

            // Sync user profile with role derived from active project
            let role = 'Admin'; // Default
            if (fetchedProjects.length > 0 && currentActiveId) {
                const activeProject = fetchedProjects.find(p => p._id === currentActiveId);
                const userInTeam = activeProject?.team?.find(m => m.email === user.email);
                role = activeProject?.user === user._id || userInTeam?.role === 'Admin' ? 'Admin' : 'Member';
            }

            setUserProfile({
                id: user._id,
                name: user.name,
                email: user.email,
                role: role,
                avatar: `https://ui-avatars.com/api/?name=${user.name}&background=7D00FF&color=fff`,
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                onboardingComplete: user.onboardingComplete
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [isDemoMode]);

    // Load data on mount or when user changes
    useEffect(() => {
        if (currentUser) {
            fetchData(currentUser);
        } else {
            setProjects([]);
            setTasks([]);
            setNotes([]);
            setUserProfile(null);
            setActiveProjectId(null);
            setLoading(false);
        }
    }, [currentUser, fetchData]);

    const joinProject = useCallback(async (projectId) => {
        if (!currentUser || !currentUser.token) return;
        try {
            const joinedProject = await projectService.joinProject(projectId, currentUser.token);
            setProjects(prev => [...prev, joinedProject]);
            setActiveProjectId(joinedProject._id);

            // Update user onboarding status locally
            const updatedUser = { ...currentUser, onboardingComplete: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Sync userProfile immediately to prevent unwanted redirects
            setUserProfile(prev => ({
                ...prev,
                onboardingComplete: true
            }));

            setCurrentUser(updatedUser);

            return joinedProject;
        } catch (error) {
            console.error('Error joining project:', error);
            throw error;
        }
    }, [currentUser]);

    // Handle auto-joining projects from invite link (both for new and existing users)
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const joinId = query.get('join');

        if (joinId) {
            console.log('[DashboardContext] Join request detected for project:', joinId);
            if (currentUser && !isDemoMode) {
                // If logged in, join immediately
                joinProject(joinId)
                    .then(() => {
                        // Clear param from URL after joining
                        navigate(location.pathname, { replace: true });
                    })
                    .catch(err => {
                        console.error('Join failed:', err);
                    });
            } else {
                // If not logged in, save for later
                localStorage.setItem('joinProjectId', joinId);
            }
        } else if (currentUser && !isDemoMode) {
            // Check if there's a pending join from a previous session
            const pendingJoinId = localStorage.getItem('joinProjectId');
            if (pendingJoinId) {
                localStorage.removeItem('joinProjectId');
                joinProject(pendingJoinId).catch(err => {
                    console.error('Auto-join failed:', err);
                });
            }
        }
    }, [currentUser, isDemoMode, joinProject, location.pathname, location.search, navigate]);

    // Save UI preferences to localStorage
    useEffect(() => {
        if (currentUser) {
            const userId = currentUser._id;
            localStorage.setItem(`${userId}_showGreeting`, JSON.stringify(showGreeting));
            localStorage.setItem(`${userId}_isSidebarCollapsed`, JSON.stringify(isSidebarCollapsed));
            localStorage.setItem(`${userId}_activeProjectId`, activeProjectId);
        }
    }, [showGreeting, isSidebarCollapsed, activeProjectId, currentUser]);

    // Sync theme with localStorage
    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const login = useCallback((userData) => {
        localStorage.removeItem('isDemoMode');
        setIsDemoMode(false);
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        setUserProfile({
            id: userData._id,
            name: userData.name,
            email: userData.email,
            role: 'Member',
            avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=7D00FF&color=fff`,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            onboardingComplete: userData.onboardingComplete
        });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('isDemoMode');
        setIsDemoMode(false);
        setCurrentUser(null);
    }, []);

    const enterDemoMode = useCallback(() => {
        localStorage.setItem('isDemoMode', 'true');
        setIsDemoMode(true);
        setCurrentUser(DEMO_DATA.user);
        setUserProfile({
            id: DEMO_DATA.user._id,
            name: DEMO_DATA.user.name,
            email: DEMO_DATA.user.email,
            role: 'Demo User',
            avatar: `https://ui-avatars.com/api/?name=Guest+Explorer&background=7D00FF&color=fff`,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        });
    }, []);

    // Project CRUD
    const addProject = useCallback(async (project) => {
        if (!currentUser) return;

        if (isDemoMode) {
            const newProject = { ...project, _id: `demo_p_${Date.now()}`, team: [{ ...userProfile, role: 'Owner' }] };
            setProjects(prev => [...prev, newProject]);
            setActiveProjectId(newProject._id);
            return;
        }

        if (!currentUser.token) return;
        try {
            const projectTeam = project.team || [];
            // Ensure owner is in the team as Admin
            if (!projectTeam.some(m => m.email === currentUser.email)) {
                projectTeam.push({
                    id: currentUser._id,
                    name: currentUser.name,
                    email: currentUser.email,
                    role: 'Admin',
                    avatar: `https://ui-avatars.com/api/?name=${currentUser.name}&background=7D00FF&color=fff`
                });
            }

            const newProject = await projectService.createProject({
                ...project,
                team: projectTeam
            }, currentUser.token);

            setProjects(prev => [...prev, newProject]);

            // Update user onboarding status locally
            const updatedUser = { ...currentUser, onboardingComplete: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Sync userProfile immediately to prevent unwanted redirects
            setUserProfile(prev => ({
                ...prev,
                onboardingComplete: true
            }));

            setCurrentUser(updatedUser);

            if (project.tasks && project.tasks.length > 0) {
                const tasksWithIds = project.tasks.map((t) => ({
                    ...t,
                    projectId: newProject._id,
                    status: 'Todo',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                    deadline: t.deadline || new Date().toISOString().split('T')[0],
                    members: t.members || [],
                    tags: [{ label: t.priority, color: t.priority === 'High' ? 'purple' : 'cyan' }],
                    subtasks: t.subtasks || []
                }));

                for (const task of tasksWithIds) {
                    await taskService.createTask(task, currentUser.token);
                }

                const updatedTasks = await taskService.getTasks(newProject._id, currentUser.token);
                setTasks(updatedTasks);
            }

            setActiveProjectId(newProject._id);
        } catch (error) {
            console.error('Error adding project:', error.response?.data || error.message);
        }
    }, [currentUser, userProfile, isDemoMode]);

    const updateProject = useCallback(async (id, updates) => {
        if (!currentUser) return;

        if (isDemoMode) {
            setProjects(prev => prev.map(p => p._id === id ? { ...p, ...updates } : p));
            return;
        }

        if (!currentUser.token) return;
        try {
            const updated = await projectService.updateProject(id, updates, currentUser.token);
            setProjects(prev => prev.map(p => p._id === id ? updated : p));
        } catch (error) {
            console.error('Error updating project:', error);
        }
    }, [currentUser, isDemoMode]);

    const deleteProject = useCallback(async (id) => {
        if (!currentUser) return;

        if (isDemoMode) {
            setProjects(prev => prev.filter(p => p._id !== id));
            setTasks(prev => prev.filter(t => t.projectId !== id));
            if (activeProjectId === id) setActiveProjectId(null);
            return;
        }

        if (!currentUser.token) return;
        try {
            await projectService.deleteProject(id, currentUser.token);
            setProjects(prev => prev.filter(p => p._id !== id));
            setTasks(prev => prev.filter(t => t.projectId !== id));
            if (activeProjectId === id) setActiveProjectId(null);
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    }, [currentUser, activeProjectId, isDemoMode]);


    // Task CRUD
    const addTask = useCallback(async (task) => {
        if (!currentUser || !activeProjectId) return;

        if (isDemoMode) {
            const newTask = {
                ...task,
                _id: `demo_t_${Date.now()}`,
                projectId: activeProjectId,
                deadline: task.deadline || new Date().toISOString().split('T')[0],
                subtasks: task.subtasks || []
            };
            setTasks(prev => [...prev, newTask]);
            return;
        }

        if (!currentUser.token) return;
        try {
            const now = new Date();
            const newTask = await taskService.createTask({
                ...task,
                projectId: activeProjectId,
                deadline: task.deadline || now.toISOString().split('T')[0],
                subtasks: task.subtasks || []
            }, currentUser.token);

            setTasks(prev => [...prev, newTask]);
        } catch (error) {
            console.error('Error adding task:', error.response?.data || error.message);
        }
    }, [currentUser, activeProjectId, isDemoMode]);

    const updateTask = useCallback(async (id, updates) => {
        if (!currentUser) return;

        if (isDemoMode) {
            setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updates } : t));
            return;
        }

        if (!currentUser.token) return;
        try {
            const updated = await taskService.updateTask(id, updates, currentUser.token);
            setTasks(prev => prev.map(t => t._id === id ? updated : t));
        } catch (error) {
            console.error('Error updating task:', error.response?.data || error.message);
        }
    }, [currentUser, isDemoMode]);

    const deleteTask = useCallback(async (id) => {
        if (!currentUser) return;

        if (isDemoMode) {
            setTasks(prev => prev.filter(t => t._id !== id));
            return;
        }

        if (!currentUser.token) return;
        try {
            await taskService.deleteTask(id, currentUser.token);
            setTasks(prev => prev.filter(t => t._id !== id));
        } catch (error) {
            console.error('Error deleting task:', error.response?.data || error.message);
        }
    }, [currentUser, isDemoMode]);

    // Note CRUD
    const addNote = useCallback(async (note) => {
        if (!currentUser) return;

        if (isDemoMode) {
            const newNote = { ...note, _id: `demo_n_${Date.now()}`, date: new Date().toISOString() };
            setNotes(prev => [newNote, ...prev]);
            return;
        }

        if (!currentUser.token) return;
        try {
            const newNote = await noteService.createNote(note, currentUser.token);
            setNotes(prev => [newNote, ...prev]);
        } catch (error) {
            console.error('Error adding note:', error.response?.data || error.message);
        }
    }, [currentUser, isDemoMode]);

    const updateNote = useCallback(async (id, updates) => {
        if (!currentUser) return;

        if (isDemoMode) {
            setNotes(prev => prev.map(n => n._id === id ? { ...n, ...updates } : n));
            return;
        }

        if (!currentUser.token) return;
        try {
            const updated = await noteService.updateNote(id, updates, currentUser.token);
            setNotes(prev => prev.map(n => n._id === id ? updated : n));
        } catch (error) {
            console.error('Error updating note:', error.response?.data || error.message);
        }
    }, [currentUser, isDemoMode]);

    const deleteNote = useCallback(async (id) => {
        if (!currentUser) return;

        if (isDemoMode) {
            setNotes(prev => prev.filter(n => n._id !== id));
            return;
        }

        if (!currentUser.token) return;
        try {
            await noteService.deleteNote(id, currentUser.token);
            setNotes(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting note:', error.response?.data || error.message);
        }
    }, [currentUser, isDemoMode]);

    const toggleSubtask = useCallback(async (taskId, subtaskId) => {
        if (!currentUser) return;

        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        const newSubtasks = task.subtasks.map(s => {
            const currentId = s._id || s.id;
            return currentId === subtaskId ? { ...s, completed: !s.completed } : s;
        });

        if (isDemoMode) {
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, subtasks: newSubtasks } : t));
            return;
        }

        if (!currentUser.token) return;
        try {
            const updated = await taskService.updateTask(taskId, { subtasks: newSubtasks }, currentUser.token);
            setTasks(prev => prev.map(t => t._id === taskId ? updated : t));
        } catch (error) {
            console.error('Error toggling subtask:', error);
        }
    }, [currentUser, tasks, isDemoMode]);

    // Filtered Tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (task.projectId !== activeProjectId) return false;
            if (filters.priority !== 'All' && task.priority !== filters.priority) return false;
            if (filters.status !== 'All' && task.status !== filters.status) return false;
            if (filters.keyword && !task.title.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
            return true;
        });
    }, [tasks, activeProjectId, filters]);

    // Stats
    const stats = useMemo(() => {
        const activeTasks = tasks.filter(t => t.projectId === activeProjectId);
        const activeProject = projects.find(p => p._id === activeProjectId);

        const globalCompletedTasks = tasks.filter(t => t.status === 'Done').length;

        const isTaskAssignedToMe = (t) => {
            const members = t.members || [];
            const myId = userProfile?.id;
            const myEmail = userProfile?.email;
            const activeProject = projects.find(p => p._id === activeProjectId);

            const isAssignedDirectly =
                members.includes(myId) ||
                (myEmail && members.includes(myEmail)) ||
                members.includes('me') ||
                t.assignee === 'Me';

            if (isAssignedDirectly) return true;

            return members.some(memberId => {
                const teamMember = activeProject?.team?.find(m => m._id === memberId || m.id === memberId || m.id === 'me');
                return teamMember && teamMember.email === myEmail;
            });
        };

        const myOverdueTasks = tasks.filter(t =>
            isTaskAssignedToMe(t) &&
            new Date(t.deadline) < new Date().setHours(0, 0, 0, 0) &&
            t.status !== 'Done'
        ).length;

        const myTasksDueToday = tasks.filter(t =>
            isTaskAssignedToMe(t) &&
            new Date(t.deadline).toDateString() === new Date().toDateString() &&
            t.status !== 'Done'
        ).length;

        const projectDetailedStats = projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project._id);
            if (projectTasks.length === 0) return 0;

            let weightedProgressTotal = 0;
            projectTasks.forEach(t => {
                if (t.subtasks && t.subtasks.length > 0) {
                    const completed = t.subtasks.filter(s => s.completed).length;
                    weightedProgressTotal += (completed / t.subtasks.length);
                } else if (t.status === 'Done') {
                    weightedProgressTotal += 1;
                }
            });
            return (weightedProgressTotal / projectTasks.length);
        });

        const globalProgress = projectDetailedStats.length > 0
            ? Math.round((projectDetailedStats.reduce((a, b) => a + b, 0) / projectDetailedStats.length) * 100)
            : 0;

        let activeWeightedProgressTotal = 0;
        activeTasks.forEach(t => {
            if (t.subtasks && t.subtasks.length > 0) {
                const completed = t.subtasks.filter(s => s.completed).length;
                activeWeightedProgressTotal += (completed / t.subtasks.length);
            } else if (t.status === 'Done') {
                activeWeightedProgressTotal += 1;
            }
        });

        const activeProjectProgress = activeTasks.length > 0
            ? Math.round((activeWeightedProgressTotal / activeTasks.length) * 100)
            : 0;

        return {
            totalProjects: projects.length,
            totalTasks: tasks.length,
            completedTasks: globalCompletedTasks,
            overdueTasks: myOverdueTasks,
            tasksDueToday: myTasksDueToday,
            projectProgress: activeProjectProgress,
            globalProgress: globalProgress,
            activeProjectName: activeProject?.name || 'Active Project'
        };
    }, [tasks, projects, activeProjectId, userProfile]);

    const value = {
        projects,
        tasks,
        notes,
        activeProjectId,
        setActiveProjectId,
        filters,
        setFilters,
        filteredTasks,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        toggleSubtask,
        addNote,
        updateNote,
        deleteNote,
        stats,
        isDemoMode,
        enterDemoMode,
        showGreeting,
        setShowGreeting,
        userProfile,
        setUserProfile,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        theme,
        toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
        login,
        logout,
        joinProject,
        currentUserRole: useMemo(() => {
            const activeProject = projects.find(p => p._id === activeProjectId);
            if (!activeProject) return 'Member';
            if (activeProject.user === currentUser?._id) return 'Owner';
            const member = activeProject.team?.find(m => m.email === currentUser?.email);
            return member?.role || 'Member';
        }, [projects, activeProjectId, currentUser])
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};
