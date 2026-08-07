import React, { useState, useMemo } from 'react';
import {
    FiLayout, FiArrowLeft, FiSearch, FiCopy, FiCheck, FiBook,
    FiZap, FiDatabase, FiShield, FiCode, FiSmartphone, FiHelpCircle,
    FiAlertCircle, FiTrendingUp, FiCheckCircle, FiClock, FiMaximize2,
    FiExternalLink, FiGithub, FiTerminal, FiUsers, FiPlus, FiMoon, FiChevronDown,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useDashboard } from '../context/DashboardContext';

const Section = ({ id, title, children, icon }) => {
    const { theme } = useDashboard();
    return (
        <section id={id} className={`mb-16 scroll-mt-24 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
                    {icon}
                </div>
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} tracking-tight uppercase`}>{title}</h2>
            </div>
            <div className="space-y-4 text-[11px] font-medium leading-relaxed">
                {children}
            </div>
        </section>
    );
};

const CodeBlock = ({ code, language = 'bash' }) => {
    const [copied, setCopied] = useState(false);
    const { theme } = useDashboard();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`relative group my-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'} overflow-hidden`}>
            <div className={`flex items-center justify-between px-4 py-2 border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-white'} `}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language}</span>
                <button
                    onClick={copyToClipboard}
                    className="p-1.5 hover:text-neon-cyan transition-colors"
                    title="Copy to clipboard"
                >
                    {copied ? <FiCheck size={14} className="text-emerald-400" /> : <FiCopy size={14} />}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto custom-scrollbar">
                <code className={`text-[10px] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{code}</code>
            </pre>
        </div>
    );
};

const DashboardDocs = () => {
    const navigate = useNavigate();
    const { theme } = useDashboard();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        { id: 'getting-started', title: '1. Getting Started', icon: <FiBook /> },
        { id: 'quick-start', title: '2. Quick Start Guide', icon: <FiZap /> },
        { id: 'core-concepts', title: '3. Core Concepts', icon: <FiDatabase /> },
        { id: 'analytics', title: '4. Dashboard & Analytics', icon: <FiTrendingUp /> },
        { id: 'security', title: '5. Authentication & Security', icon: <FiShield /> },
        { id: 'api-reference', title: '6. API Reference', icon: <FiCode /> },
        { id: 'ui-guide', title: '7. UI Guide', icon: <FiSmartphone /> },
        { id: 'faq', title: '8. FAQ Section', icon: <FiHelpCircle /> },
        { id: 'troubleshooting', title: '9. Troubleshooting', icon: <FiAlertCircle /> },
        { id: 'roadmap', title: '10. Future Roadmap', icon: <FiTrendingUp /> },
    ];

    const filteredSections = sections.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleScroll = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'} font-['Outfit'] overflow-hidden transition-colors duration-300`}>
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Search Header */}
                <header className={`sticky top-0 z-40 px-8 py-4 border-b backdrop-blur-md ${theme === 'dark' ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200'}`}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4 w-full max-w-md">
                            <div className="relative w-full">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search documentation..."
                                    className={`w-full pl-10 pr-4 py-2 text-[11px] rounded-xl border focus:outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/10 focus:border-neon-cyan/50 text-white' : 'bg-white border-slate-200 focus:border-neon-cyan'}`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">v1.0.4 • Last updated Feb 25, 2026</span>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-white text-slate-500 hover:text-slate-900 shadow-sm'}`}
                                title="Back to Dashboard"
                            >
                                <FiArrowLeft size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden w-full">
                    {/* Table of Contents - Left Stick */}
                    <nav className={`w-64 overflow-y-auto custom-scrollbar p-8 hidden md:block border-r ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">On this page</h4>
                        <div className="space-y-1">
                            {filteredSections.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleScroll(s.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[10.5px] font-bold transition-all text-left ${activeSection === s.id
                                        ? 'bg-neon-cyan/10 text-neon-cyan'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                >
                                    <span className="flex-shrink-0">{s.icon}</span>
                                    <span className="truncate">{s.title.split('. ')[1]}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Content Area - Right Scroll */}
                    <article className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 pb-32">

                        <Section id="getting-started" title="1. Getting Started" icon={<FiBook />}>
                            <p className="text-[12px] font-black leading-tight text-neon-cyan mb-2">Welcome to ProSync Enterprise.</p>
                            <p>ProSync is a futuristic project management orchestration tool designed for high-performance teams who value speed, aesthetics, and clarity. It eliminates the friction of traditional task management by providing a "Midnight Neon" command center for your entire workflow.</p>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8`}>
                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    <h4 className="text-[10px] font-black text-electric-purple uppercase tracking-widest mb-2">The Problem</h4>
                                    <p className="text-[10px]">Overwhelmed by cluttered UI, slow legacy tools, and disconnected project data? ProSync bridges the gap between deep work and project transparency.</p>
                                </div>
                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    <h4 className="text-[10px] font-black text-neon-cyan uppercase tracking-widest mb-2">The Solution</h4>
                                    <p className="text-[10px]">A ultra-fast, React-powered, state-of-the-art dashboard that leverages real-time analytics and progress weighting to keep you ahead of every deadline.</p>
                                </div>
                            </div>
                        </Section>

                        <Section id="quick-start" title="2. Quick Start Guide" icon={<FiZap />}>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-electric-purple flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">1</div>
                                    <div>
                                        <h4 className={`text-[11px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase mb-1`}>Initialize Project</h4>
                                        <p>Click the <FiPlus className="inline mx-1" /> icon in the sidebar to create your first board. Name it and set your initial deadline.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center text-[10px] font-black text-midnight flex-shrink-0">2</div>
                                    <div>
                                        <h4 className={`text-[11px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase mb-1`}>Assemble Your Elite Team</h4>
                                        <p>Inside the Project Modal, add team members by email. They'll automatically appear in your task assignment dropdowns.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">3</div>
                                    <div>
                                        <h4 className={`text-[11px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase mb-1`}>Ship Tasks</h4>
                                        <p>Create tasks, set priorities, and add milestones (subtasks). Toggle statuses from "Todo" to "Done" to watch your progress bar move in real-time.</p>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section id="core-concepts" title="3. Core Concepts" icon={<FiDatabase />}>
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-neon-cyan text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 font-black">
                                        <FiLayout /> The Project Entity
                                    </h4>
                                    <p>A Project is the top-level container. It encapsulates team members, global progress metrics, and task collections. Deleting a project removes all associated tasks and notes – act with caution.</p>
                                </div>
                                <div>
                                    <h4 className="text-electric-purple text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FiCheckCircle /> Task Life Cycle
                                    </h4>
                                    <p>Tasks flow through: <span className="text-slate-400">Todo → In Progress → Review → Done</span>. Each task can have multiple subtasks that act as "Milestones" for high-fidelity tracking.</p>
                                </div>
                                <div>
                                    <h4 className="text-pink-500 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FiUsers /> Team Roles
                                    </h4>
                                    <p>The creator of a project is the <strong>Admin</strong>. Everyone who joins through the invite link is a <strong>Collaborator</strong> — they can work on tasks but cannot edit or delete the project itself.</p>
                                </div>
                            </div>
                        </Section>

                        <Section id="analytics" title="4. Dashboard & Analytics" icon={<FiTrendingUp />}>
                            <p>ProSync uses weighted algorithms to calculate real-time project health. Here is how we quantify your work:</p>
                            <div className={`mt-6 space-y-4`}>
                                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-100'}`}>
                                    <span className="text-neon-cyan font-black mr-2 uppercase tracking-tighter">[Weighted Progress]</span>
                                    Progress is not just "tasks done". We calculate the completion of subtasks to give a granular percentage. If a task has 4 subtasks and 2 are done, it contributes 50% of its weight to the project total.
                                </div>
                                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-100'}`}>
                                    <span className="text-rose-500 font-black mr-2 uppercase tracking-tighter">[Risk Detection]</span>
                                    Tasks appearing in "Overdue" are automatically flagged by the system when the current date passes the recorded deadline. These are displayed in high-contrast rose colors in the Summary Cards.
                                </div>
                            </div>
                        </Section>

                        <Section id="security" title="5. Authentication & Security" icon={<FiShield />}>
                            <p>Your data security is paramount. ProSync leverages modern web standards to ensure your workspace remains private.</p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li><strong>JWT (JSON Web Tokens):</strong> Every session is secured with a signed token stored in encrypted local storage.</li>
                                <li><strong>Bcrypt Hashing:</strong> Passwords never touch our database in plain text; they are hashed with 10 salt rounds.</li>
                                <li><strong>Bearer Authorization:</strong> All sensitive API calls require a valid `Authorization: Bearer {'<token>'}` header.</li>
                            </ul>
                        </Section>

                        <Section id="api-reference" title="6. API Reference" icon={<FiCode />}>
                            <p>For developers and power users, here is the skeleton of our REST architecture.</p>

                            <div className="mt-6">
                                <h5 className={`text-[10px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase mb-2`}>Authentication</h5>
                                <CodeBlock language="POST /api/auth/login" code={`{
  "email": "user@prosync.com",
  "password": "strongpassword123"
}`} />

                                <h5 className={`text-[10px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase mb-2 mt-6`}>Project Management</h5>
                                <CodeBlock language="GET /api/projects" code={`Authorization: Bearer <your_jwt_token>`} />
                                <CodeBlock language="POST /api/tasks" code={`{
  "title": "Build UI",
  "priority": "High",
  "deadline": "2026-03-15",
  "projectId": "123456"
}`} />
                            </div>
                        </Section>

                        <Section id="ui-guide" title="7. UI Guide" icon={<FiSmartphone />}>
                            <p>The ProSync interface is designed to stay out of your way while providing maximum utility.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                <div className="flex flex-col items-center p-3 text-center border border-white/5 rounded-xl bg-white/[0.01]">
                                    <FiMoon className="text-neon-cyan mb-2" />
                                    <span className="text-[9px] font-black uppercase">Dark Mode</span>
                                    <p className="text-[8px] mt-1">Saves energy and reduces eye strain during late-night sprints.</p>
                                </div>
                                <div className="flex flex-col items-center p-3 text-center border border-white/5 rounded-xl bg-white/[0.01]">
                                    <FiMaximize2 className="text-electric-purple mb-2" />
                                    <span className="text-[9px] font-black uppercase">Sidebar Collapse</span>
                                    <p className="text-[8px] mt-1">Focus on your board by minimized the navigation rail.</p>
                                </div>
                                <div className="flex flex-col items-center p-3 text-center border border-white/5 rounded-xl bg-white/[0.01]">
                                    <FiSearch className="text-pink-500 mb-2" />
                                    <span className="text-[9px] font-black uppercase">Smart Filters</span>
                                    <p className="text-[8px] mt-1">Quickly slice data by priority, assignee, or keyword.</p>
                                </div>
                            </div>
                        </Section>

                        <Section id="faq" title="8. FAQ Section" icon={<FiHelpCircle />}>
                            <div className="space-y-4">
                                <details className={`group border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} pb-3 cursor-pointer`}>
                                    <summary className={`flex justify-between items-center text-[11px] font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} list-none uppercase tracking-widest`}>
                                        Why can't I see my project?
                                        <FiChevronDown className="group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <p className="mt-2 text-[10px] text-slate-500">Check if you are switched to a different project in the sidebar or if your session has expired.</p>
                                </details>
                                <details className={`group border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} pb-3 cursor-pointer`}>
                                    <summary className={`flex justify-between items-center text-[11px] font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} list-none uppercase tracking-widest`}>
                                        How is progress calculated?
                                        <FiChevronDown className="group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <p className="mt-2 text-[10px] text-slate-500">Progress is the average completion percent of all tasks in a project, weighted by their subtask status.</p>
                                </details>
                            </div>
                        </Section>

                        <Section id="troubleshooting" title="9. Troubleshooting" icon={<FiAlertCircle />}>
                            <div className="grid grid-cols-1 gap-2">
                                <div className={`p-4 rounded-xl border-l-4 border-rose-500 ${theme === 'dark' ? 'bg-rose-500/5' : 'bg-rose-50'}`}>
                                    <h5 className="text-[10px] font-black text-rose-500 uppercase mb-1">401 Unauthorized</h5>
                                    <p className="text-[10px]">Your session has token expired. Log out and log back in to refresh your JWT.</p>
                                </div>
                                <div className={`p-4 rounded-xl border-l-4 border-amber-500 ${theme === 'dark' ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
                                    <h5 className="text-[10px] font-black text-amber-500 uppercase mb-1">Data not loading</h5>
                                    <p className="text-[10px]">Ensure the backend server is running on port 5001 and your internet connection is active.</p>
                                </div>
                            </div>
                        </Section>

                        <Section id="roadmap" title="10. Future Roadmap" icon={<FiTrendingUp />}>
                            <p>We are constantly evolving the ProSync ecosystem. Here is what is on the horizon for 2026:</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>Real-time Notifications</span>
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>Native Mobile App (iOS/Android)</span>
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>AI-Powered Task Summaries</span>
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>Advanced Gantt Charts</span>
                            </div>
                        </Section>

                        {/* Footer */}
                        <footer className={`mt-20 pt-10 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} text-center`}>
                            <div className="flex items-center justify-center gap-6 mb-6">
                                <FiGithub className="text-slate-500 hover:text-white transition-colors cursor-pointer" size={20} />
                                <FiExternalLink className="text-slate-500 hover:text-white transition-colors cursor-pointer" size={20} />
                                <FiTerminal className="text-slate-500 hover:text-white transition-colors cursor-pointer" size={20} />
                            </div>
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">Built for the future. ProSync © 2026</p>
                        </footer>
                    </article>
                </div>
            </main>
        </div>
    );
};

export default DashboardDocs;
