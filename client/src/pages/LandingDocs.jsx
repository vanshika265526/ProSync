<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiBook, FiZap, FiUsers, FiShield, FiTrendingUp, FiCheckCircle,
    FiArrowRight, FiPlay, FiSearch, FiCode, FiSmartphone, FiLayout,
    FiMenu, FiX, FiChevronDown, FiGlobe, FiClock, FiStar, FiPlus, FiDatabase
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

const LandingDocs = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("overview");
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const sections = [
        { id: "overview", label: "Overview", icon: <FiGlobe /> },
        { id: "workflow", label: "The Workflow", icon: <FiZap /> },
        { id: "features", label: "Core Features", icon: <FiStar /> },
        { id: "collaboration", label: "Team Work", icon: <FiUsers /> },
        { id: "security", label: "Security", icon: <FiShield /> },
    ];

    const workflowSteps = [
        {
            title: "1. Create Your Command Center",
            desc: "Initialize your first project board with ProSync's lightning-fast setup. Define your vision, set milestones, and establish your timeline in seconds.",
            icon: <FiPlus className="text-neon-cyan" />,
            color: "bg-neon-cyan/10"
        },
        {
            title: "2. Rally The Elite",
            desc: "Invite your team members via encrypted channels. ProSync handles permissions and role assignments automatically, getting everyone in sync instantly.",
            icon: <FiUsers className="text-electric-purple" />,
            color: "bg-electric-purple/10"
        },
        {
            title: "3. Precision Execution",
            desc: "Break down complex projects into granular tasks. Track every moving part with subtasks, dependencies, and real-time status orchestration.",
            icon: <FiZap className="text-pink-500" />,
            color: "bg-pink-500/10"
        },
        {
            title: "4. Ship With Confidence",
            desc: "Watch your progress bars move toward completion. Use our weighted performance metrics to identify risks before they become blockers.",
            icon: <FiCheckCircle className="text-emerald-500" />,
            color: "bg-emerald-500/10"
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-midnight font-['Outfit'] transition-colors duration-300 selection:bg-neon-cyan selection:text-midnight overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-midnight/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-8 h-8 bg-electric-purple rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-purple-glow">
                            PS
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">ProSync</span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Link to="/" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Home</Link>
                        <div
                            className="relative group py-4"
                            onMouseEnter={() => setActiveDropdown('product')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1 hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">
                                Product <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'product' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                                    <Link to="/#features" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-neon-cyan/10 text-neon-cyan group-hover/item:bg-neon-cyan group-hover/item:text-midnight transition-all">
                                            <FiZap size={14} />
                                        </div>
                                        <span>Features</span>
                                    </Link>
                                    <Link to="/#workflow" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-electric-purple/10 text-electric-purple group-hover/item:bg-electric-purple group-hover/item:text-white transition-all">
                                            <FiUsers size={14} />
                                        </div>
                                        <span>Workflow</span>
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        <Link to="/docs" className="text-electric-purple dark:text-neon-cyan transition-colors font-bold">Documentation</Link>
                        <Link to="/#pricing" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Pricing</Link>
                        <Link to="/contact" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Contact</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Login</Link>
                        <Link to="/signup" className="text-sm font-bold bg-[#00F2EA] text-slate-900 px-6 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all">Get Started</Link>
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-700 dark:text-slate-200">
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed top-20 left-0 w-full bg-white dark:bg-midnight z-40 md:hidden border-b border-slate-100 dark:border-slate-800"
                    >
                        <div className="p-6 flex flex-col gap-6">
                            <Link to="/" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/#features" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Features</Link>
                            <Link to="/docs" className="text-lg font-bold text-neon-cyan" onClick={() => setIsMenuOpen(false)}>Documentation</Link>
                            <Link to="/contact" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                                <Link to="/login" className="w-full py-4 text-center font-bold border border-slate-200 dark:border-slate-800 rounded-2xl">Login</Link>
                                <Link to="/signup" className="w-full py-4 text-center font-bold bg-neon-cyan text-midnight rounded-2xl">Get Started</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <header className="pt-40 pb-20 px-6 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-purple/10 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-cyan/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                    >
                        <span className="px-4 py-2 rounded-full bg-electric-purple/10 text-electric-purple text-xs font-black uppercase tracking-[0.2em] mb-6 inline-block border border-electric-purple/20">
                            The ProSync Guide
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 tracking-tighter">
                            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-cyan">Workflow</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Welcome to the ultimate guide for ProSync. Learn how to transform your project management into a high-octane engineering machine.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-midnight font-bold rounded-2xl flex items-center gap-2 hover:scale-[1.05] transition-all group">
                                <FiPlay size={18} /> Watch Video Tour
                            </button>
                            <Link to="/signup" className="px-8 py-4 bg-neon-cyan text-midnight font-bold rounded-2xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,242,234,0.3)] transition-all">
                                Try ProSync Now <FiArrowRight />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Content Navigation */}
            <div className="sticky top-20 z-30 bg-white/50 dark:bg-midnight/50 backdrop-blur-xl border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-center gap-8 py-4 min-w-max">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeSection === section.id ? 'text-electric-purple dark:text-neon-cyan' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <span className={`${activeSection === section.id ? 'animate-pulse' : ''}`}>{section.icon}</span>
                                {section.label}
                                {activeSection === section.id && <motion.div layoutId="underline" className="h-0.5 w-full bg-current absolute bottom-0 left-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-20 space-y-32">
                {/* 1. Overview */}
                <section id="overview" className="scroll-mt-40">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">What is <span className="text-neon-cyan">ProSync</span>?</h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                ProSync isn't just a project management tool; it's a productivity ecosystem. Built for teams that demand excellence, it combines state-of-the-art UI with deep data orchestration.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: <FiClock />, text: "Ship projects 40% faster with optimized workflows." },
                                    { icon: <FiTrendingUp />, text: "Real-time weighted metrics for precision tracking." },
                                    { icon: <FiShield />, text: "Enterprise-grade security with JWT & Bcrypt encryption." }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-medium">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-neon-cyan">
                                            {item.icon}
                                        </div>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-video bg-gradient-to-br from-electric-purple to-neon-cyan rounded-[2rem] p-1 shadow-2xl overflow-hidden group">
                                <div className="w-full h-full bg-slate-950 rounded-[1.8rem] flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-midnight shadow-glow hover:scale-110 transition-transform">
                                            <FiPlay size={24} fill="currentColor" />
                                        </button>
                                        <span className="text-xs font-black uppercase tracking-widest text-white/60">Experience the Interface</span>
                                    </div>
                                </div>
                            </div>
                            {/* Floating decorative elements */}
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-neon-cyan/20 blur-2xl rounded-full"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-electric-purple/20 blur-2xl rounded-full"></div>
                        </motion.div>
                    </div>
                </section>

                {/* 2. Workflow */}
                <section id="workflow" className="scroll-mt-40">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Seamless <span className="text-electric-purple">Workflow</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">From concept to deployment, ProSync follows a rigid but flexible process.</p>
                    </div>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {workflowSteps.map((step, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 hover:-translate-y-2 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-6 text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                                    {step.icon}
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{step.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* 3. Core Features */}
                <section id="features" className="scroll-mt-40">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">High Performance <span className="text-neon-cyan">Features</span></h2>
                        <p className="text-slate-500 dark:text-slate-400">Precision-engineered tools for every stage of your project.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Dynamic Task Boards", desc: "Drag-drop task life cycles with custom subtask granularity.", icon: <FiLayout className="text-neon-cyan" /> },
                            { title: "Smart Resource Hub", desc: "Keep all your assets, files and project notes in one synced space.", icon: <FiDatabase className="text-electric-purple" /> },
                            { title: "Weighted Analytics", desc: "Proprietary algorithm that calculates completion based on milestone impact.", icon: <FiTrendingUp className="text-pink-500" /> },
                            { title: "Universal Command", desc: "Switch between List, Board, and Analytics view instantly.", icon: <FiSearch className="text-blue-500" /> },
                            { title: "Responsive Control", desc: "Design-first approach ensures productivity on desktop or mobile.", icon: <FiSmartphone className="text-amber-500" /> },
                            { title: "Dev-Ready Integration", desc: "Extensive API access for custom hooks and integrations.", icon: <FiCode className="text-emerald-500" /> }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none hover:shadow-2xl dark:hover:border-neon-cyan/30 transition-all flex flex-col gap-4"
                            >
                                <div className="text-3xl">{feature.icon}</div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. Collaboration */}
                <section id="collaboration" className="scroll-mt-40">
                    <div className="bg-slate-900 dark:bg-slate-900/30 rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-electric-purple/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Built for <span className="text-electric-purple">Teams</span></h2>
                                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                    Collaboration shouldn't be chaotic. ProSync creates a single source of truth for your entire organization, whether you're 5 or 5,000.
                                </p>
                                <ul className="space-y-4">
                                    {["One-click team invitations", "Role-based access control", "Activity streams & change logs", "Seamless stakeholder reporting"].map((bullet, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-200">
                                            <FiCheckCircle className="text-neon-cyan" /> {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                                    <div className="text-4xl font-bold text-white mb-2">100%</div>
                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Real-time Sync</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                                    <div className="text-4xl font-bold text-white mb-2">Unlimited</div>
                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Contributors</p>
                                </div>
                                <div className="col-span-2 bg-gradient-to-r from-electric-purple/20 to-neon-cyan/20 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-white tracking-tight">Joining the future of work.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. CTA Section */}
                <section className="text-center py-20 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 tracking-tighter">Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-cyan">Ascend?</span></h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
                            The next generation of project management is already here. Join thousands of high-performance teams.
                        </p>
                        <div className="flex flex-col items-center gap-6">
                            <Link to="/signup" className="px-10 py-5 bg-gradient-to-r from-electric-purple to-neon-cyan text-white font-bold rounded-2xl shadow-glow hover:scale-[1.05] transition-all">
                                Launch Your First Board
                            </Link>
                            <Link to="/contact" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors">Talk to Sales Team</Link>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-[#020617] py-20 px-6 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-electric-purple rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-purple-glow">P</div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">ProSync</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Redefining project management for the modern elite workforce.</p>
                        <div className="flex gap-4">
                            {/* Social Icons */}
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-neon-cyan transition-colors cursor-pointer border border-transparent dark:hover:border-neon-cyan/20">
                                    <FiGlobe size={18} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Product</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/#features" className="hover:text-neon-cyan">Features</Link></li>
                            <li><Link to="/#workflow" className="hover:text-neon-cyan">Workflow</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Support</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/docs" className="hover:text-neon-cyan">Documentation</Link></li>
                            <li><Link to="/contact" className="hover:text-neon-cyan">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Legal</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="#" className="hover:text-neon-cyan">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-neon-cyan">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <p>&copy; 2026 ProSync Technologies Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <span>Built with Passion in SF</span>
                        <span>v2.4.0 (Stable)</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingDocs;
=======
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiBook, FiZap, FiUsers, FiShield, FiTrendingUp, FiCheckCircle,
    FiArrowRight, FiPlay, FiSearch, FiCode, FiSmartphone, FiLayout,
    FiMenu, FiX, FiChevronDown, FiGlobe, FiClock, FiStar, FiPlus, FiDatabase
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

const LandingDocs = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("overview");
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const sections = [
        { id: "overview", label: "Overview", icon: <FiGlobe /> },
        { id: "workflow", label: "The Workflow", icon: <FiZap /> },
        { id: "features", label: "Core Features", icon: <FiStar /> },
        { id: "collaboration", label: "Team Work", icon: <FiUsers /> },
        { id: "security", label: "Security", icon: <FiShield /> },
    ];

    const workflowSteps = [
        {
            title: "1. Create Your Command Center",
            desc: "Initialize your first project board with ProSync's lightning-fast setup. Define your vision, set milestones, and establish your timeline in seconds.",
            icon: <FiPlus className="text-neon-cyan" />,
            color: "bg-neon-cyan/10"
        },
        {
            title: "2. Rally The Elite",
            desc: "Invite your team members via encrypted channels. ProSync handles permissions and role assignments automatically, getting everyone in sync instantly.",
            icon: <FiUsers className="text-electric-purple" />,
            color: "bg-electric-purple/10"
        },
        {
            title: "3. Precision Execution",
            desc: "Break down complex projects into granular tasks. Track every moving part with subtasks, dependencies, and real-time status orchestration.",
            icon: <FiZap className="text-pink-500" />,
            color: "bg-pink-500/10"
        },
        {
            title: "4. Ship With Confidence",
            desc: "Watch your progress bars move toward completion. Use our weighted performance metrics to identify risks before they become blockers.",
            icon: <FiCheckCircle className="text-emerald-500" />,
            color: "bg-emerald-500/10"
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-midnight font-['Outfit'] transition-colors duration-300 selection:bg-neon-cyan selection:text-midnight overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-midnight/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-8 h-8 bg-electric-purple rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-purple-glow">
                            PS
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">ProSync</span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Link to="/" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Home</Link>
                        <div
                            className="relative group py-4"
                            onMouseEnter={() => setActiveDropdown('product')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1 hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">
                                Product <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'product' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                                    <Link to="/#features" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-neon-cyan/10 text-neon-cyan group-hover/item:bg-neon-cyan group-hover/item:text-midnight transition-all">
                                            <FiZap size={14} />
                                        </div>
                                        <span>Features</span>
                                    </Link>
                                    <Link to="/#workflow" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-electric-purple/10 text-electric-purple group-hover/item:bg-electric-purple group-hover/item:text-white transition-all">
                                            <FiUsers size={14} />
                                        </div>
                                        <span>Workflow</span>
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        <Link to="/docs" className="text-electric-purple dark:text-neon-cyan transition-colors font-bold">Documentation</Link>
                        <Link to="/#pricing" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Pricing</Link>
                        <Link to="/contact" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Contact</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Login</Link>
                        <Link to="/signup" className="text-sm font-bold bg-[#00F2EA] text-slate-900 px-6 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all">Get Started</Link>
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-700 dark:text-slate-200">
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed top-20 left-0 w-full bg-white dark:bg-midnight z-40 md:hidden border-b border-slate-100 dark:border-slate-800"
                    >
                        <div className="p-6 flex flex-col gap-6">
                            <Link to="/" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/#features" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Features</Link>
                            <Link to="/docs" className="text-lg font-bold text-neon-cyan" onClick={() => setIsMenuOpen(false)}>Documentation</Link>
                            <Link to="/contact" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                                <Link to="/login" className="w-full py-4 text-center font-bold border border-slate-200 dark:border-slate-800 rounded-2xl">Login</Link>
                                <Link to="/signup" className="w-full py-4 text-center font-bold bg-neon-cyan text-midnight rounded-2xl">Get Started</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <header className="pt-40 pb-20 px-6 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-purple/10 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-cyan/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                    >
                        <span className="px-4 py-2 rounded-full bg-electric-purple/10 text-electric-purple text-xs font-black uppercase tracking-[0.2em] mb-6 inline-block border border-electric-purple/20">
                            The ProSync Guide
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 tracking-tighter">
                            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-cyan">Workflow</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Welcome to the ultimate guide for ProSync. Learn how to transform your project management into a high-octane engineering machine.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-midnight font-bold rounded-2xl flex items-center gap-2 hover:scale-[1.05] transition-all group">
                                <FiPlay size={18} /> Watch Video Tour
                            </button>
                            <Link to="/signup" className="px-8 py-4 bg-neon-cyan text-midnight font-bold rounded-2xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,242,234,0.3)] transition-all">
                                Try ProSync Now <FiArrowRight />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Content Navigation */}
            <div className="sticky top-20 z-30 bg-white/50 dark:bg-midnight/50 backdrop-blur-xl border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-center gap-8 py-4 min-w-max">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeSection === section.id ? 'text-electric-purple dark:text-neon-cyan' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <span className={`${activeSection === section.id ? 'animate-pulse' : ''}`}>{section.icon}</span>
                                {section.label}
                                {activeSection === section.id && <motion.div layoutId="underline" className="h-0.5 w-full bg-current absolute bottom-0 left-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-20 space-y-32">
                {/* 1. Overview */}
                <section id="overview" className="scroll-mt-40">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">What is <span className="text-neon-cyan">ProSync</span>?</h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                ProSync isn't just a project management tool; it's a productivity ecosystem. Built for teams that demand excellence, it combines state-of-the-art UI with deep data orchestration.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: <FiClock />, text: "Ship projects 40% faster with optimized workflows." },
                                    { icon: <FiTrendingUp />, text: "Real-time weighted metrics for precision tracking." },
                                    { icon: <FiShield />, text: "Enterprise-grade security with JWT & Bcrypt encryption." }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-medium">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-neon-cyan">
                                            {item.icon}
                                        </div>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-video bg-gradient-to-br from-electric-purple to-neon-cyan rounded-[2rem] p-1 shadow-2xl overflow-hidden group">
                                <div className="w-full h-full bg-slate-950 rounded-[1.8rem] flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-midnight shadow-glow hover:scale-110 transition-transform">
                                            <FiPlay size={24} fill="currentColor" />
                                        </button>
                                        <span className="text-xs font-black uppercase tracking-widest text-white/60">Experience the Interface</span>
                                    </div>
                                </div>
                            </div>
                            {/* Floating decorative elements */}
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-neon-cyan/20 blur-2xl rounded-full"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-electric-purple/20 blur-2xl rounded-full"></div>
                        </motion.div>
                    </div>
                </section>

                {/* 2. Workflow */}
                <section id="workflow" className="scroll-mt-40">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Seamless <span className="text-electric-purple">Workflow</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">From concept to deployment, ProSync follows a rigid but flexible process.</p>
                    </div>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {workflowSteps.map((step, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 hover:-translate-y-2 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-6 text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                                    {step.icon}
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{step.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* 3. Core Features */}
                <section id="features" className="scroll-mt-40">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">High Performance <span className="text-neon-cyan">Features</span></h2>
                        <p className="text-slate-500 dark:text-slate-400">Precision-engineered tools for every stage of your project.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Dynamic Task Boards", desc: "Drag-drop task life cycles with custom subtask granularity.", icon: <FiLayout className="text-neon-cyan" /> },
                            { title: "Smart Resource Hub", desc: "Keep all your assets, files and project notes in one synced space.", icon: <FiDatabase className="text-electric-purple" /> },
                            { title: "Weighted Analytics", desc: "Proprietary algorithm that calculates completion based on milestone impact.", icon: <FiTrendingUp className="text-pink-500" /> },
                            { title: "Universal Command", desc: "Switch between List, Board, and Analytics view instantly.", icon: <FiSearch className="text-blue-500" /> },
                            { title: "Responsive Control", desc: "Design-first approach ensures productivity on desktop or mobile.", icon: <FiSmartphone className="text-amber-500" /> },
                            { title: "Dev-Ready Integration", desc: "Extensive API access for custom hooks and integrations.", icon: <FiCode className="text-emerald-500" /> }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none hover:shadow-2xl dark:hover:border-neon-cyan/30 transition-all flex flex-col gap-4"
                            >
                                <div className="text-3xl">{feature.icon}</div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. Collaboration */}
                <section id="collaboration" className="scroll-mt-40">
                    <div className="bg-slate-900 dark:bg-slate-900/30 rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-electric-purple/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Built for <span className="text-electric-purple">Teams</span></h2>
                                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                    Collaboration shouldn't be chaotic. ProSync creates a single source of truth for your entire organization, whether you're 5 or 5,000.
                                </p>
                                <ul className="space-y-4">
                                    {["One-click team invitations", "Role-based access control", "Activity streams & change logs", "Seamless stakeholder reporting"].map((bullet, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-200">
                                            <FiCheckCircle className="text-neon-cyan" /> {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                                    <div className="text-4xl font-bold text-white mb-2">100%</div>
                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Real-time Sync</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                                    <div className="text-4xl font-bold text-white mb-2">Unlimited</div>
                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Contributors</p>
                                </div>
                                <div className="col-span-2 bg-gradient-to-r from-electric-purple/20 to-neon-cyan/20 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-white tracking-tight">Joining the future of work.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. CTA Section */}
                <section className="text-center py-20 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 tracking-tighter">Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-cyan">Ascend?</span></h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
                            The next generation of project management is already here. Join thousands of high-performance teams.
                        </p>
                        <div className="flex flex-col items-center gap-6">
                            <Link to="/signup" className="px-10 py-5 bg-gradient-to-r from-electric-purple to-neon-cyan text-white font-bold rounded-2xl shadow-glow hover:scale-[1.05] transition-all">
                                Launch Your First Board
                            </Link>
                            <Link to="/contact" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors">Talk to Sales Team</Link>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-[#020617] py-20 px-6 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-electric-purple rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-purple-glow">P</div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">ProSync</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Redefining project management for the modern elite workforce.</p>
                        <div className="flex gap-4">
                            {/* Social Icons */}
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-neon-cyan transition-colors cursor-pointer border border-transparent dark:hover:border-neon-cyan/20">
                                    <FiGlobe size={18} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Product</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/#features" className="hover:text-neon-cyan">Features</Link></li>
                            <li><Link to="/#workflow" className="hover:text-neon-cyan">Workflow</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Support</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/docs" className="hover:text-neon-cyan">Documentation</Link></li>
                            <li><Link to="/contact" className="hover:text-neon-cyan">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Legal</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="#" className="hover:text-neon-cyan">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-neon-cyan">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <p>&copy; 2026 ProSync Technologies Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <span>Built with Passion in SF</span>
                        <span>v2.4.0 (Stable)</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingDocs;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
