import {
    FiPlus, FiFolderPlus, FiUserPlus, FiGrid, FiList, FiCalendar,
    FiFileText, FiSettings, FiUsers, FiCheckSquare, FiGithub, FiClock,
    FiActivity, FiSun, FiMoon, FiSearch, FiHome, FiHelpCircle, FiUser,
    FiRefreshCw, FiLink, FiExternalLink, FiLogOut,
} from 'react-icons/fi';

/**
 * The palette's static command catalogue.
 *
 * Built as a factory rather than a constant because most commands need to
 * close over live app state — `run` calls into handlers Home registers, and
 * several commands hide themselves when they don't apply (no repo connected,
 * caller isn't an Admin).
 *
 * `keywords` exist so "cal" finds Calendar and "inv" finds Invite Member even
 * though neither is a prefix of the visible label.
 */

export const GROUPS = {
    QUICK: 'Quick Actions',
    NAVIGATION: 'Navigation',
    GITHUB: 'GitHub',
    SEARCH: 'Search',
    RECENT: 'Recent',
    PREFERENCES: 'Preferences',
};

/**
 * @param {Object} ctx
 * @param {Function} ctx.run          run a registered action by name
 * @param {Function} ctx.navigate     react-router navigate
 * @param {Function} ctx.close        close the palette
 * @param {boolean}  ctx.isAdmin
 * @param {boolean}  ctx.hasRepo
 * @param {string}   ctx.theme
 * @param {Function} ctx.toggleTheme
 * @param {string}   [ctx.repoUrl]
 */
export const buildCommands = (ctx) => {
    const {
        run, navigate, close, isAdmin, hasRepo, theme, toggleTheme, repoUrl,
    } = ctx;

    // Small wrapper: every command closes the palette before it acts, so the
    // modal is never left hanging over a route transition.
    const act = (fn) => () => { close(); fn(); };

    const commands = [
        // --- Quick Actions ---
        {
            id: 'action.create-task',
            group: GROUPS.QUICK,
            label: 'Create Task',
            subtitle: 'Add a task to the current project',
            icon: FiPlus,
            iconTone: 'text-neon-cyan',
            iconBg: 'bg-neon-cyan/10',
            keywords: ['new', 'add', 'todo', 'ticket', 'issue'],
            visible: isAdmin,
            run: act(() => run('create-task')),
        },
        {
            id: 'action.create-project',
            group: GROUPS.QUICK,
            label: 'Create Project',
            subtitle: 'Start a new board',
            icon: FiFolderPlus,
            iconTone: 'text-electric-purple',
            iconBg: 'bg-electric-purple/10',
            keywords: ['new', 'add', 'board', 'workspace'],
            visible: isAdmin,
            run: act(() => run('create-project')),
        },
        {
            id: 'action.invite-member',
            group: GROUPS.QUICK,
            label: 'Invite Member',
            subtitle: 'Send an invitation link',
            icon: FiUserPlus,
            iconTone: 'text-amber-400',
            iconBg: 'bg-amber-500/10',
            keywords: ['invite', 'add', 'teammate', 'collaborator', 'people'],
            run: act(() => run('invite-member')),
        },
        {
            id: 'action.activity-feed',
            group: GROUPS.QUICK,
            label: 'Open Activity Feed',
            subtitle: 'Live project activity',
            icon: FiActivity,
            iconTone: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10',
            keywords: ['live', 'feed', 'realtime', 'stream'],
            run: act(() => run('open-activity')),
        },

        // --- Navigation ---
        {
            id: 'nav.dashboard',
            group: GROUPS.NAVIGATION,
            label: 'Dashboard',
            subtitle: 'Overview and my tasks',
            icon: FiHome,
            keywords: ['home', 'overview', 'my tasks'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'My Tasks'); }),
        },
        {
            id: 'nav.board',
            group: GROUPS.NAVIGATION,
            label: 'Board',
            subtitle: 'Kanban view',
            icon: FiGrid,
            keywords: ['kanban', 'columns', 'cards'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'Board'); }),
        },
        {
            id: 'nav.list',
            group: GROUPS.NAVIGATION,
            label: 'List',
            subtitle: 'Table view of tasks',
            icon: FiList,
            keywords: ['table', 'rows'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'List'); }),
        },
        {
            id: 'nav.calendar',
            group: GROUPS.NAVIGATION,
            label: 'Calendar',
            subtitle: 'Deadlines by date',
            icon: FiCalendar,
            keywords: ['schedule', 'dates', 'deadlines', 'month'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'Calendar'); }),
        },
        {
            id: 'nav.notes',
            group: GROUPS.NAVIGATION,
            label: 'Notes',
            subtitle: 'Project notes',
            icon: FiFileText,
            keywords: ['docs', 'writing', 'memo'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'Notes'); }),
        },
        {
            id: 'nav.members',
            group: GROUPS.NAVIGATION,
            label: 'Members',
            subtitle: 'Team roster',
            icon: FiUsers,
            keywords: ['team', 'people', 'collaborators'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'Members'); }),
        },
        {
            id: 'nav.history',
            group: GROUPS.NAVIGATION,
            label: 'History',
            subtitle: 'Project timeline',
            icon: FiClock,
            keywords: ['timeline', 'audit', 'log', 'changes'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'History'); }),
        },
        {
            id: 'nav.my-tasks',
            group: GROUPS.NAVIGATION,
            label: 'My Tasks',
            subtitle: 'Assigned to you',
            icon: FiCheckSquare,
            keywords: ['mine', 'assigned'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'My Tasks'); }),
        },
        {
            id: 'nav.profile',
            group: GROUPS.NAVIGATION,
            label: 'Profile',
            subtitle: 'Your account',
            icon: FiUser,
            keywords: ['account', 'me'],
            run: act(() => navigate('/profile')),
        },
        {
            id: 'nav.settings',
            group: GROUPS.NAVIGATION,
            label: 'Settings',
            subtitle: 'Preferences and account',
            icon: FiSettings,
            keywords: ['preferences', 'config', 'options'],
            run: act(() => run('open-settings')),
        },
        {
            id: 'nav.support',
            group: GROUPS.NAVIGATION,
            label: 'Help & Support',
            icon: FiHelpCircle,
            keywords: ['help', 'docs', 'contact'],
            run: act(() => navigate('/support')),
        },

        // --- GitHub ---
        {
            id: 'github.connect',
            group: GROUPS.GITHUB,
            label: 'Connect Repository',
            subtitle: hasRepo ? 'Change the linked repository' : 'Link a GitHub repository',
            icon: FiLink,
            iconTone: 'text-slate-300',
            iconBg: 'bg-slate-500/15',
            keywords: ['git', 'repo', 'link', 'attach'],
            visible: isAdmin,
            run: act(() => { navigate('/dashboard'); run('set-tab', 'GitHub'); run('connect-repo'); }),
        },
        {
            id: 'github.open',
            group: GROUPS.GITHUB,
            label: 'Open Repository',
            subtitle: 'View on github.com',
            icon: FiExternalLink,
            iconTone: 'text-slate-300',
            iconBg: 'bg-slate-500/15',
            keywords: ['git', 'repo', 'browse', 'github'],
            visible: hasRepo && !!repoUrl,
            run: act(() => window.open(repoUrl, '_blank', 'noopener,noreferrer')),
        },
        {
            id: 'github.sync',
            group: GROUPS.GITHUB,
            label: 'Sync Repository',
            subtitle: 'Pull the latest commits, PRs and issues',
            icon: FiRefreshCw,
            iconTone: 'text-slate-300',
            iconBg: 'bg-slate-500/15',
            keywords: ['git', 'refresh', 'pull', 'update'],
            visible: hasRepo,
            run: act(() => run('sync-repo')),
        },
        {
            id: 'github.dashboard',
            group: GROUPS.GITHUB,
            label: 'GitHub Dashboard',
            subtitle: 'Commits, pull requests and issues',
            icon: FiGithub,
            iconTone: 'text-slate-300',
            iconBg: 'bg-slate-500/15',
            keywords: ['git', 'repo', 'overview'],
            run: act(() => { navigate('/dashboard'); run('set-tab', 'GitHub'); }),
        },

        // --- Search scopes ---
        // These don't navigate; they prefix the query so the result list
        // narrows to one entity type.
        {
            id: 'search.tasks',
            group: GROUPS.SEARCH,
            label: 'Search Tasks',
            subtitle: 'Find a task by title',
            icon: FiSearch,
            keywords: ['find', 'lookup', 'task'],
            scope: 'task',
        },
        {
            id: 'search.projects',
            group: GROUPS.SEARCH,
            label: 'Search Projects',
            subtitle: 'Find a project by name',
            icon: FiSearch,
            keywords: ['find', 'lookup', 'board'],
            scope: 'project',
        },
        {
            id: 'search.members',
            group: GROUPS.SEARCH,
            label: 'Search Members',
            subtitle: 'Find a teammate',
            icon: FiSearch,
            keywords: ['find', 'lookup', 'people', 'who'],
            scope: 'member',
        },
        {
            id: 'search.notes',
            group: GROUPS.SEARCH,
            label: 'Search Notes',
            subtitle: 'Find a note',
            icon: FiSearch,
            keywords: ['find', 'lookup', 'docs'],
            scope: 'note',
        },

        // --- Preferences ---
        {
            id: 'pref.theme',
            group: GROUPS.PREFERENCES,
            label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            subtitle: 'Toggle the colour theme',
            icon: theme === 'dark' ? FiSun : FiMoon,
            iconTone: 'text-amber-400',
            iconBg: 'bg-amber-500/10',
            keywords: ['theme', 'dark', 'light', 'appearance', 'colour', 'color'],
            run: act(() => toggleTheme()),
        },
        {
            id: 'pref.logout',
            group: GROUPS.PREFERENCES,
            label: 'Sign Out',
            subtitle: 'End your session',
            icon: FiLogOut,
            iconTone: 'text-rose-400',
            iconBg: 'bg-rose-500/10',
            keywords: ['logout', 'exit', 'leave', 'quit'],
            run: act(() => run('logout')),
        },
    ];

    // `visible: undefined` means "always"; only an explicit false hides it.
    return commands.filter((c) => c.visible !== false);
};

export default buildCommands;
