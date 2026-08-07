<<<<<<< HEAD
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiChevronDown, FiZap, FiMenu, FiX, FiShield, FiUsers } from "react-icons/fi";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import axios from "axios";
import { API_BASE } from "../services/apiClient";

const LandingContact = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [status, setStatus] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await axios.post(`${API_BASE}/support/message`, formData);
            setStatus('sent');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-midnight font-['Outfit'] transition-colors duration-300 selection:bg-neon-cyan selection:text-midnight overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-midnight/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50">
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
                        <span className="text-xl font-bold text-slate-900 dark:text-white">ProSync</span>
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
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
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

                        <div
                            className="relative group py-4"
                            onMouseEnter={() => setActiveDropdown('resources')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1 hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">
                                Resources <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'resources' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
                                    <Link to="/docs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                                            <FiShield size={14} />
                                        </div>
                                        <span>Documentation</span>
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                        <Link to="/#pricing" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Pricing</Link>
                        <Link to="/contact" className="text-electric-purple dark:text-neon-cyan transition-colors font-bold">Contact</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 px-4 py-2 hover:text-electric-purple transition-colors">Login</Link>
                        <Link to="/signup" className="text-sm font-bold bg-[#00F2EA] text-slate-900 px-5 py-2.5 rounded-lg hover:shadow-lg transition-all">Get Started</Link>
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-700 dark:text-slate-200">
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="fixed top-20 left-0 w-full bg-white dark:bg-midnight z-40 md:hidden border-b border-slate-100 dark:border-slate-800"
                >
                    <div className="p-6 flex flex-col gap-6">
                        <Link to="/" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/#features" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link to="/#workflow" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Workflow</Link>
                        <Link to="/docs" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Documentation</Link>
                        <Link to="/#pricing" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                        <Link to="/contact" className="text-lg font-bold text-electric-purple dark:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                            <Link to="/login" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple transition-colors" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="text-lg font-bold bg-[#00F2EA] text-slate-900 px-5 py-2.5 rounded-lg text-center hover:shadow-lg transition-all" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                        </div>
                    </div>
                </motion.div>
            )}

            <main className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-cyan">Connect</span></h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Have questions about ProSync? Our team is here to help you optimize your workflow.</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-slate-50 dark:bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-purple to-neon-cyan"></div>

                            {status === 'sent' ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FiCheckCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8">We'll get back to you within 24 hours.</p>
                                    <button onClick={() => setStatus('')} className="text-neon-cyan font-bold hover:underline">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                                                placeholder="Alex Johnson"
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Work Email</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                                                placeholder="alex@company.com"
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Category</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none appearance-none"
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            >
                                                <option>General Inquiry</option>
                                                <option>Sales & Demo</option>
                                                <option>Enterprise Support</option>
                                                <option>Partnership</option>
                                            </select>
                                            <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Message</label>
                                        <textarea
                                            required
                                            rows="5"
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all resize-none"
                                            placeholder="Tell us how we can help..."
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full py-5 bg-gradient-to-r from-electric-purple to-neon-cyan text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                                    >
                                        {status === 'sending' ? 'Transmitting...' : <><FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Message</>}
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8 py-4"
                        >
                            <div className="space-y-12">
                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-neon-cyan/10 text-neon-cyan rounded-2xl flex items-center justify-center flex-shrink-0 border border-neon-cyan/20">
                                        <FiMail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Email Us</h4>
                                        <p className="text-slate-500 dark:text-slate-400 mb-2">Expect a response within 24 hours.</p>
                                        <a href="mailto:hello@prosync.io" className="text-electric-purple dark:text-neon-cyan font-bold hover:underline">hello@prosync.io</a>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-electric-purple/10 text-electric-purple rounded-2xl flex items-center justify-center flex-shrink-0 border border-electric-purple/20">
                                        <FiPhone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Call Sales</h4>
                                        <p className="text-slate-500 dark:text-slate-400 mb-2">Mon-Fri from 9am to 6pm EST.</p>
                                        <a href="tel:+15551234567" className="text-electric-purple dark:text-neon-cyan font-bold hover:underline">+1 (555) 123-4567</a>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                        <FiMapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Visit Office</h4>
                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                            101 Tech Way, Suite 400<br />
                                            Silicon Valley, CA 94025
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Follow us</h4>
                                <div className="flex gap-4">
                                    {['FaTwitter', 'FaLinkedin', 'FaGithub'].map((social, i) => (
                                        <div key={i} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-neon-cyan cursor-pointer transition-colors">
                                            {/* Simplified placeholders for social icons */}
                                            <div className="w-4 h-4 bg-current opacity-20"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-[#020617] py-16 px-6 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 bg-electric-purple rounded flex items-center justify-center text-white font-bold text-xs shadow-purple-glow">P</div>
                            <span className="font-bold text-slate-900 dark:text-white">ProSync</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">The operating system for modern product teams.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/#features" className="hover:text-neon-cyan">Features</Link></li>
                            <li><Link to="/#workflow" className="hover:text-neon-cyan">Workflow</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/contact" className="hover:text-neon-cyan">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Resources</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/docs" className="hover:text-neon-cyan">Documentation</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-4 text-xs text-slate-400">
                    <p>&copy; 2026 ProSync Technologies Inc.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingContact;
=======
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiChevronDown, FiZap, FiMenu, FiX, FiShield, FiUsers } from "react-icons/fi";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import axios from "axios";

const LandingContact = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [status, setStatus] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await axios.post('http://localhost:5001/api/support/message', formData);
            setStatus('sent');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-midnight font-['Outfit'] transition-colors duration-300 selection:bg-neon-cyan selection:text-midnight overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-midnight/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50">
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
                        <span className="text-xl font-bold text-slate-900 dark:text-white">ProSync</span>
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
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
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

                        <div
                            className="relative group py-4"
                            onMouseEnter={() => setActiveDropdown('resources')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1 hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">
                                Resources <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'resources' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
                                    <Link to="/docs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                                        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                                            <FiShield size={14} />
                                        </div>
                                        <span>Documentation</span>
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                        <Link to="/#pricing" className="hover:text-electric-purple dark:hover:text-neon-cyan transition-colors">Pricing</Link>
                        <Link to="/contact" className="text-electric-purple dark:text-neon-cyan transition-colors font-bold">Contact</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 px-4 py-2 hover:text-electric-purple transition-colors">Login</Link>
                        <Link to="/signup" className="text-sm font-bold bg-[#00F2EA] text-slate-900 px-5 py-2.5 rounded-lg hover:shadow-lg transition-all">Get Started</Link>
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-700 dark:text-slate-200">
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="fixed top-20 left-0 w-full bg-white dark:bg-midnight z-40 md:hidden border-b border-slate-100 dark:border-slate-800"
                >
                    <div className="p-6 flex flex-col gap-6">
                        <Link to="/" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/#features" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link to="/#workflow" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Workflow</Link>
                        <Link to="/docs" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Documentation</Link>
                        <Link to="/#pricing" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple dark:hover:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                        <Link to="/contact" className="text-lg font-bold text-electric-purple dark:text-neon-cyan transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                            <Link to="/login" className="text-lg font-bold text-slate-800 dark:text-white hover:text-electric-purple transition-colors" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="text-lg font-bold bg-[#00F2EA] text-slate-900 px-5 py-2.5 rounded-lg text-center hover:shadow-lg transition-all" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                        </div>
                    </div>
                </motion.div>
            )}

            <main className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-cyan">Connect</span></h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Have questions about ProSync? Our team is here to help you optimize your workflow.</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-slate-50 dark:bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-purple to-neon-cyan"></div>

                            {status === 'sent' ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FiCheckCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8">We'll get back to you within 24 hours.</p>
                                    <button onClick={() => setStatus('')} className="text-neon-cyan font-bold hover:underline">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                                                placeholder="Alex Johnson"
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Work Email</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                                                placeholder="alex@company.com"
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Category</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none appearance-none"
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            >
                                                <option>General Inquiry</option>
                                                <option>Sales & Demo</option>
                                                <option>Enterprise Support</option>
                                                <option>Partnership</option>
                                            </select>
                                            <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Message</label>
                                        <textarea
                                            required
                                            rows="5"
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all resize-none"
                                            placeholder="Tell us how we can help..."
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full py-5 bg-gradient-to-r from-electric-purple to-neon-cyan text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                                    >
                                        {status === 'sending' ? 'Transmitting...' : <><FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Message</>}
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8 py-4"
                        >
                            <div className="space-y-12">
                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-neon-cyan/10 text-neon-cyan rounded-2xl flex items-center justify-center flex-shrink-0 border border-neon-cyan/20">
                                        <FiMail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Email Us</h4>
                                        <p className="text-slate-500 dark:text-slate-400 mb-2">Expect a response within 24 hours.</p>
                                        <a href="mailto:hello@prosync.io" className="text-electric-purple dark:text-neon-cyan font-bold hover:underline">hello@prosync.io</a>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-electric-purple/10 text-electric-purple rounded-2xl flex items-center justify-center flex-shrink-0 border border-electric-purple/20">
                                        <FiPhone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Call Sales</h4>
                                        <p className="text-slate-500 dark:text-slate-400 mb-2">Mon-Fri from 9am to 6pm EST.</p>
                                        <a href="tel:+15551234567" className="text-electric-purple dark:text-neon-cyan font-bold hover:underline">+1 (555) 123-4567</a>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                        <FiMapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Visit Office</h4>
                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                            101 Tech Way, Suite 400<br />
                                            Silicon Valley, CA 94025
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Follow us</h4>
                                <div className="flex gap-4">
                                    {['FaTwitter', 'FaLinkedin', 'FaGithub'].map((social, i) => (
                                        <div key={i} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-neon-cyan cursor-pointer transition-colors">
                                            {/* Simplified placeholders for social icons */}
                                            <div className="w-4 h-4 bg-current opacity-20"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-[#020617] py-16 px-6 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 bg-electric-purple rounded flex items-center justify-center text-white font-bold text-xs shadow-purple-glow">P</div>
                            <span className="font-bold text-slate-900 dark:text-white">ProSync</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">The operating system for modern product teams.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/#features" className="hover:text-neon-cyan">Features</Link></li>
                            <li><Link to="/#workflow" className="hover:text-neon-cyan">Workflow</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/contact" className="hover:text-neon-cyan">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Resources</h4>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li><Link to="/docs" className="hover:text-neon-cyan">Documentation</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-4 text-xs text-slate-400">
                    <p>&copy; 2026 ProSync Technologies Inc.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingContact;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
