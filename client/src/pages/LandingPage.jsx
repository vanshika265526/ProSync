import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiUsers, FiZap, FiMenu, FiX, FiChevronDown, FiMail } from "react-icons/fi";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useDashboard } from "../context/DashboardContext";

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [activeDropdown, setActiveDropdown] = React.useState(null);
    const { enterDemoMode } = useDashboard();
    const navigate = useNavigate();

    // Parallax effect for hero background
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
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

    const handleViewDemo = (e) => {
        e.preventDefault();
        enterDemoMode();
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-white dark:bg-midnight font-['Outfit'] transition-colors duration-300 selection:bg-neon-cyan selection:text-midnight overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-midnight/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-8 h-8 bg-electric-purple rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-purple-glow">
                            PS
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">ProSync</span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300"
                    >
                        <Link to="/" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Home</Link>
                        {/* Product Dropdown */}
                        <div
                            className="relative group py-4"
                            onMouseEnter={() => setActiveDropdown('product')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1 hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">
                                Product <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'product' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50"
                                >
                                    <a href="#features" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-neon-cyan/10 text-neon-cyan group-hover/item:bg-neon-cyan group-hover/item:text-midnight transition-all">
                                            <FiZap size={14} />
                                        </div>
                                        <span>Features</span>
                                    </a>
                                    <a href="#workflow" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-electric-purple/10 text-electric-purple group-hover/item:bg-electric-purple group-hover/item:text-white transition-all">
                                            <FiUsers size={14} />
                                        </div>
                                        <span>Workflow</span>
                                    </a>
                                </motion.div>
                            )}
                        </div>

                        {/* Resources Dropdown */}
                        <div
                            className="relative group py-4"
                            onMouseEnter={() => setActiveDropdown('resources')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1 hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">
                                Resources <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'resources' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50"
                                >
                                    <Link to="/docs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                                            <FiShield size={14} />
                                        </div>
                                        <span>Documentation</span>
                                    </Link>
                                    <a href="#testimonials" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                                            <FiUsers size={14} />
                                        </div>
                                        <span>Customers</span>
                                    </a>
                                </motion.div>
                            )}
                        </div>

                        <a href="#pricing" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Pricing</a>
                        <Link to="/contact" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Contact</Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="hidden md:flex items-center gap-4"
                    >
                        <ThemeToggle />
                        <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-electric-purple dark:hover:text-neon-cyan px-4 py-2 transition-colors">
                            Login
                        </Link>
                        <Link to="/signup" className="relative group overflow-hidden text-sm font-bold bg-[#00F2EA] hover:bg-[#00d4cc] text-slate-900 px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg">
                            <span className="relative z-10 group-hover:text-slate-900 transition-colors">Get Started</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </Link>
                    </motion.div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-700 dark:text-slate-200">
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-midnight border-b border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-xl overflow-hidden"
                    >
                        <div className="space-y-4">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 hover:text-electric-purple dark:hover:text-neon-cyan font-medium pl-2">Home</Link>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mt-4">Product</p>
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 hover:text-electric-purple dark:hover:text-neon-cyan font-medium pl-2">Features</a>
                            <a href="#workflow" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 hover:text-electric-purple dark:hover:text-neon-cyan font-medium pl-2">Workflow</a>

                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mt-6">Resources</p>
                            <Link to="/docs" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 hover:text-electric-purple dark:hover:text-neon-cyan font-medium pl-2">Documentation</Link>
                            <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 hover:text-electric-purple dark:hover:text-neon-cyan font-medium pl-2">Customers</a>

                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mt-6">Company</p>
                            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 hover:text-electric-purple dark:hover:text-neon-cyan font-medium pl-2">Pricing</a>
                            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 hover:text-electric-purple dark:hover:text-neon-cyan font-medium pl-2">Contact</Link>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                            <ThemeToggle />
                            <div className="flex gap-4">
                                <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>Login</Link>
                                <Link to="/signup" className="text-sm font-medium text-electric-purple dark:text-neon-cyan font-bold" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            < section className="pt-32 pb-20 px-6 relative overflow-hidden" >
                {/* Background Glows with Parallax */}
                < div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none z-0" >
                    <motion.div style={{ y: y1 }} className="absolute top-20 left-[20%] w-[500px] h-[500px] bg-electric-purple/20 rounded-full blur-[120px] mix-blend-screen"></motion.div>
                    <motion.div style={{ y: y2 }} className="absolute top-40 right-[20%] w-[400px] h-[400px] bg-neon-cyan/20 rounded-full blur-[100px] mix-blend-screen"></motion.div>
                </div >

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-8 backdrop-blur-sm"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-neon-cyan mr-2 animate-pulse"></span>
                        <span className="text-xs font-semibold tracking-wide uppercase text-slate-600 dark:text-slate-300">New: AI-Powered Roadmaps</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="block"
                        >
                            Sync your team,
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple via-neon-cyan to-electric-purple bg-[length:200%_auto] animate-shine"
                        >
                            ship faster.
                        </motion.span>
                    </h1>

                    <motion.p
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        The modern standard for project management. Streamline issues, sprints, and product roadmaps in one high-performance workspace.
                    </motion.p>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                    >
                        <motion.div variants={fadeInUp}>
                            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-electric-purple/20">
                                Start Building Free
                            </Link>
                        </motion.div>
                        <motion.div variants={fadeInUp}>
                            <button onClick={handleViewDemo} className="w-full sm:w-auto px-8 py-4 bg-transparent text-slate-900 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group">
                                <FiZap className="group-hover:text-neon-cyan transition-colors" /> View Demo
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Dashboard Mockup with 3D Tilt Effect */}
                    <motion.div
                        initial={{ opacity: 0, rotateX: 10, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ willChange: "transform, opacity" }}
                        className="relative max-w-6xl mx-auto perspective-1000"
                    >
                        <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-midnight/90 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/10] group transform transition-all duration-700 hover:scale-[1.01] flex text-left font-['Outfit']">

                            {/* Mock Sidebar */}
                            <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-midnight flex-shrink-0 flex flex-col hidden md:flex">
                                <div className="p-5 flex items-center gap-3">
                                    <div className="w-6 h-6 bg-electric-purple rounded-full flex items-center justify-center text-white font-bold text-xs shadow-purple-glow">S</div>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">ProSync</span>
                                </div>
                                <div className="px-5 mb-4">
                                    <div className="h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full animate-pulse"></div>
                                </div>
                                <div className="space-y-1 px-3">
                                    {['Home', 'Tasks', 'Users', 'APIs'].map((item, i) => (
                                        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${i === 1 ? 'bg-electric-purple/10 text-electric-purple dark:text-neon-cyan' : 'text-slate-500 dark:text-slate-400'}`}>
                                            <div className="w-4 h-4 rounded bg-current opacity-20"></div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mock Main Content */}
                            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-[#0A0F29]">
                                {/* Mock Header */}
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-white dark:bg-midnight">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Neo-Tokyo App</h3>
                                            <span className="bg-neon-cyan/20 text-neon-cyan text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Dev</span>
                                        </div>
                                        <div className="flex gap-4 text-xs text-slate-400 font-medium">
                                            <span className="border-b-2 border-electric-purple text-electric-purple dark:text-neon-cyan dark:border-neon-cyan pb-3 -mb-6 px-1">Board View</span>
                                            <span className="pb-3 -mb-6 px-1">List View</span>
                                            <span className="pb-3 -mb-6 px-1">Timeline</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex -space-x-2 mr-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-midnight bg-slate-200 dark:bg-slate-700"></div>)}
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-electric-purple text-white flex items-center justify-center">+</div>
                                    </div>
                                </div>

                                {/* Mock Board */}
                                <div className="flex-1 p-6 overflow-hidden flex gap-6">
                                    {[
                                        { title: 'To Do', color: 'bg-blue-500', items: 2 },
                                        { title: 'In Progress', color: 'bg-orange-500', items: 3 },
                                        { title: 'Done', color: 'bg-green-500', items: 2 }
                                    ].map((col, i) => (
                                        <div key={i} className="flex-1 min-w-[200px] flex flex-col gap-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{col.title}</span>
                                                    <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{col.items}</span>
                                                </div>
                                            </div>

                                            {/* Task Cards - Animated Stagger within Mockup handled by CSS or simple React maps */}
                                            {col.title === 'To Do' && (
                                                <>
                                                    <div className="p-4 rounded-xl bg-white dark:bg-midnight border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 mb-2 inline-block">High Priority</span>
                                                        <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
                                                        <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex -space-x-1">
                                                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border border-white dark:border-midnight"></div>
                                                            </div>
                                                            <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-white dark:bg-midnight border border-slate-100 dark:border-slate-800 shadow-sm opacity-70">
                                                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 mb-2 inline-block">Backlog</span>
                                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
                                                    </div>
                                                </>
                                            )}

                                            {col.title === 'In Progress' && (
                                                <>
                                                    <div className="p-4 rounded-xl bg-white dark:bg-midnight border-l-4 border-electric-purple shadow-md dark:shadow-purple-glow/10 hover:translate-y-[-2px] transition-transform">
                                                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mb-3 inline-block">Design System</span>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Refactor authentication flow</p>
                                                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200" className="w-full h-24 object-cover rounded-lg mb-3" alt="Attachments" />
                                                        <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-3">
                                                            <div className="flex -space-x-2">
                                                                {[1, 2].map(k => <div key={k} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-midnight"></div>)}
                                                            </div>
                                                            <span className="text-xs text-slate-400">2 days left</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-white dark:bg-midnight border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
                                                    </div>
                                                </>
                                            )}

                                            {col.title === 'Done' && (
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 border-dashed">
                                                    <div className="flex items-center gap-2 mb-2 opacity-50">
                                                        <div className="w-4 h-4 rounded-full border border-slate-400"></div>
                                                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Gradient Overlay for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-midnight via-transparent to-transparent pointer-events-none h-32 bottom-0 top-auto opacity-50"></div>
                        </div>

                        {/* Glow under mock */}
                        <motion.div
                            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -inset-4 bg-electric-purple/20 blur-3xl -z-10 rounded-[3rem]"
                        ></motion.div>
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                            className="absolute -inset-4 bg-neon-cyan/10 blur-3xl -z-10 rounded-[3rem] translate-x-10 translate-y-10"
                        ></motion.div>
                    </motion.div>
                </div>
            </section >

            {/* Social Proof Section */}
            < section className="py-10 border-y border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-white/5" >
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-8">Trusted by next-gen teams</p>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                    >
                        {['Acme Corp', 'GlobalTech', 'Nebula', 'Velocity', 'FoxRun'].map((logo) => (
                            <motion.span
                                key={logo}
                                variants={fadeInUp}
                                className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 hover:text-electric-purple transition-colors cursor-default"
                            >
                                <div className="w-6 h-6 bg-slate-800 dark:bg-white rounded-md"></div> {logo}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>
            </section >

            {/* Features Section */}
            < section id="features" className="py-32 px-6" >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
                        >
                            Engineered for flow
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-xl text-slate-500 dark:text-slate-400"
                        >
                            Remove friction from your product development process with tools designed effectively.
                        </motion.p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid md:grid-cols-3 gap-12"
                    >
                        {[
                            {
                                icon: <FiZap size={32} />,
                                title: "Real-time Cycles",
                                desc: "Plan sprints with drag-and-drop precision. Updates sync instantly across all devices so no one is ever out of the loop."
                            },
                            {
                                icon: <FiUsers size={32} />,
                                title: "Collaborative Specs",
                                desc: "Write specs, discuss details, and finalize requirements right where the work happens. No more scattered docs."
                            },
                            {
                                icon: <FiShield size={32} />,
                                title: "Automated Workflows",
                                desc: "Set rules to auto-assign tasks, close stale issues, or notify reviewers. Let the robots handle the busy work."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-electric-purple/50 dark:hover:border-neon-cyan/50 transition-colors group"
                            >
                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-electric-purple dark:text-neon-cyan mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section >

            {/* Visual Workflow Section */}
            < section id="workflow" className="py-24 px-6 bg-slate-50 dark:bg-[#050a1f] text-slate-900 dark:text-white overflow-hidden relative" >
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-purple/5 dark:bg-electric-purple/10 rounded-full blur-[120px]"></div>

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="md:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan text-xs font-bold tracking-wider uppercase mb-6"
                        >
                            Workflow
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold mb-8"
                        >
                            From backlog to<br />shipping <span className="text-neon-cyan">in record time</span>
                        </motion.h2>
                        <div className="space-y-8">
                            {[
                                { title: "Capture ideas instantly", text: "Quickly log issues and ideas before they slip away." },
                                { title: "Prioritize with context", text: "Sort by impact, effort, or custom drivers to build what matters." },
                                { title: "Execute with precision", text: "Track progress in real-time with customizable Kanban boards." }
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex gap-4"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-electric-purple flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-purple-500/30">
                                            {i + 1}
                                        </div>
                                        {i !== 2 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 my-2"></div>}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{step.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400">{step.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="md:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-electric-purple blur-2xl opacity-20 animate-pulse"></div>
                            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl relative shadow-2xl">
                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border-l-4 border-neon-cyan shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full border-2 border-slate-500"></div>
                                            <span className="font-medium text-slate-900 dark:text-slate-200">Refactor Auth Middleware</span>
                                        </div>
                                        <span className="px-2 py-1 bg-neon-cyan/20 text-neon-cyan text-xs rounded">In Progress</span>
                                    </motion.div>
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 }}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border-l-4 border-yellow-500 opacity-80 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full border-2 border-slate-500"></div>
                                            <span className="font-medium text-slate-900 dark:text-slate-200">Update API Docs</span>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded">Review</span>
                                    </motion.div>
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.7 }}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border-l-4 border-green-500 opacity-60 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                            <span className="font-medium text-slate-900 dark:text-slate-200 line-through">Fix Navigation Bug</span>
                                        </div>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">Done</span>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section >

            {/* Customers Section */}
            < section id="testimonials" className="py-24 px-6 bg-white dark:bg-midnight" >
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 leading-snug">
                                "ProSync completely changed how we ship software. It's fast, intuitive, and actually fun to use."
                            </h2>
                            <div className="flex items-center gap-4">
                                <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-12 h-12 rounded-full ring-2 ring-electric-purple/50" />
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Elena Fisher</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">VP of Engineering @ TechFlow</p>
                                </div>
                            </div>
                        </motion.div>
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-transparent hover:border-electric-purple/30 transition-colors"
                            >
                                <div className="text-4xl font-bold text-electric-purple dark:text-neon-cyan mb-2">2x</div>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Faster shipping cycles</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-transparent hover:border-electric-purple/30 transition-colors"
                            >
                                <div className="text-4xl font-bold text-electric-purple dark:text-neon-cyan mb-2">40%</div>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Reduction in meetings</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Pricing Section Wrapper (Anchor link target) */}
            < div id="pricing" ></div >

            {/* CTA Section */}
            < section className="py-32 px-6 relative overflow-hidden" >
                <div className="absolute inset-0 bg-electric-purple/5 dark:bg-electric-purple/10"></div>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-purple/20 rounded-full blur-[120px] pointer-events-none"
                ></motion.div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 leading-tight"
                    >
                        Ready to build better?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto"
                    >
                        Join thousands of high-performance teams using ProSync to manage their projects.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-[#00F2EA] text-slate-900 font-bold rounded-xl hover:bg-[#00d4cc] transition-colors shadow-[0_0_20px_rgba(0,242,234,0.3)] hover:shadow-[0_0_30px_rgba(0,242,234,0.5)] transform hover:scale-105 duration-200">
                            Get Started for Free
                        </Link>
                    </motion.div>
                    <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">14-day free trial • No credit card required</p>
                </div>
            </section >

            {/* Footer */}
            < footer className="bg-slate-50 dark:bg-[#020617] py-16 px-6 border-t border-slate-200 dark:border-slate-800" >
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 bg-electric-purple rounded flex items-center justify-center text-white font-bold text-xs shadow-purple-glow">P</div>
                            <span className="font-bold text-slate-900 dark:text-white">ProSync</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            The operating system for modern product teams.
                        </p>
                        <div className="flex gap-4 text-slate-400">
                            <FaTwitter className="hover:text-electric-purple dark:hover:text-neon-cyan cursor-pointer transition-colors" />
                            <FaLinkedin className="hover:text-electric-purple dark:hover:text-neon-cyan cursor-pointer transition-colors" />
                            <FaGithub className="hover:text-electric-purple dark:hover:text-neon-cyan cursor-pointer transition-colors" />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><a href="#features" className="hover:text-electric-purple dark:hover:text-neon-cyan">Features</a></li>
                            <li><a href="#" className="hover:text-electric-purple dark:hover:text-neon-cyan">Changelog</a></li>
                            <li><a href="#workflow" className="hover:text-electric-purple dark:hover:text-neon-cyan">Workflow</a></li>
                            <li><a href="#" className="hover:text-electric-purple dark:hover:text-neon-cyan">Security</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><a href="#" className="hover:text-electric-purple dark:hover:text-neon-cyan">About Us</a></li>
                            <li><a href="#" className="hover:text-electric-purple dark:hover:text-neon-cyan">Careers</a></li>
                            <li><a href="#" className="hover:text-electric-purple dark:hover:text-neon-cyan">Blog</a></li>
                            <li><Link to="/contact" className="hover:text-electric-purple dark:hover:text-neon-cyan">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Resources</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><a href="#" className="hover:text-electric-purple dark:hover:text-neon-cyan">Community</a></li>
                            <li><a href="#" className="hover:text-electric-purple dark:hover:text-neon-cyan">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-electric-purple dark:hover:text-neon-cyan">Terms of Service</a></li>
                            <li><Link to="/docs" className="hover:text-electric-purple dark:hover:text-neon-cyan">Documentation</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <p>&copy; 2026 ProSync Technologies Inc. All rights reserved.</p>
                </div>
            </footer >
        </div >
    );
};

export default LandingPage;
