import React, { useState } from 'react';
import { FiMail, FiSend, FiArrowLeft, FiGlobe, FiPhone, FiBook, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useDashboard } from '../context/DashboardContext';
import axios from 'axios';
<<<<<<< HEAD
import { API_BASE } from '../services/apiClient';
=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1

const Support = () => {
    const navigate = useNavigate();
    const { theme } = useDashboard();
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const { name, email, subject, message } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setError('');

        try {
<<<<<<< HEAD
            await axios.post(`${API_BASE}/support/message`, formData);
=======
            await axios.post('http://localhost:5001/api/support/message', formData);
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
            setStatus('sent');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message');
            setStatus('');
        }
    };

    return (
        <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'} font-['Outfit'] overflow-hidden transition-colors duration-300`}>
            <Sidebar />

            <main className={`flex-1 flex flex-col min-w-0 ${theme === 'dark' ? 'bg-[#020617]/50' : 'bg-white'} relative z-10 overflow-y-auto p-4 md:p-6 custom-scrollbar`}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neon-cyan/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto w-full pt-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} hover:text-neon-cyan transition-colors mb-6 group`}
                    >
                        <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
                    </button>

                    <div className="text-center mb-8">
                        <h1 className={`text-2xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-2 tracking-tight`}>Help & <span className="text-neon-cyan">Support</span></h1>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} max-w-md mx-auto leading-relaxed`}>
                            Need assistance? Send us a message or browse our resources.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                        {/* Support Form */}
                        <div className="lg:col-span-8">
                            <div className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} p-6 rounded-3xl border backdrop-blur-sm relative overflow-hidden group transition-all`}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-electric-purple opacity-50"></div>
                                <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-6 flex items-center gap-2`}>
                                    <FiSend className="text-neon-cyan" size={18} /> Send Message
                                </h2>

                                {status === 'sent' ? (
                                    <div className="h-[300px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                                            <FiCheckCircle size={32} />
                                        </div>
                                        <h3 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold text-lg mb-1`}>Message Dispatched!</h3>
                                        <p className="text-slate-500 text-xs">Our team will respond to your email within 24 hours.</p>
                                        <button
                                            onClick={() => setStatus('')}
                                            className="mt-6 text-neon-cyan text-[10px] font-bold uppercase tracking-widest hover:underline"
                                        >
                                            Send another inquiry
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[11px] font-medium">
                                                {error}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="name"
                                                    value={name}
                                                    onChange={onChange}
                                                    className={`w-full text-xs ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl py-3 px-4 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all`}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    value={email}
                                                    onChange={onChange}
                                                    className={`w-full text-xs ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl py-3 px-4 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all`}
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Category</label>
                                            <select
                                                name="subject"
                                                value={subject}
                                                onChange={onChange}
                                                className={`w-full text-xs ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl py-3 px-4 focus:outline-none focus:border-neon-cyan/50 transition-all appearance-none`}
                                            >
                                                <option>General Inquiry</option>
                                                <option>Technical Support</option>
                                                <option>Billing Question</option>
                                                <option>Feature Request</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Message</label>
                                            <textarea
                                                required
                                                name="message"
                                                value={message}
                                                onChange={onChange}
                                                rows="4"
                                                className={`w-full text-xs ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl py-3 px-4 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all resize-none`}
                                                placeholder="Describe your issue..."
                                            ></textarea>
                                        </div>
                                        <button
                                            disabled={status === 'sending'}
                                            type="submit"
                                            className="w-full py-3.5 bg-gradient-to-r from-neon-cyan to-electric-purple text-midnight font-black rounded-xl text-[11px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                                        >
                                            {status === 'sending' ? 'Transmitting...' : <><FiSend size={14} /> Send Message</>}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions & Knowledge Base */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Contact Info Cards */}
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { icon: <FiMail />, label: 'Email', value: 'support@prosync.io', color: 'text-neon-cyan' },
                                    { icon: <FiPhone />, label: 'Support Line', value: '+1 (555) PRO-SYNC', color: 'text-electric-purple' }
                                ].map((item, i) => (
                                    <div key={i} className={`${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'} border p-4 rounded-2xl flex items-center gap-4 transition-all`}>
                                        <div className={`w-9 h-9 ${theme === 'dark' ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'} rounded-xl flex items-center justify-center ${item.color} border text-sm`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{item.label}</p>
                                            <p className={`text-[11px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold`}>{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Knowledge Base replaces Live Chat */}
                            <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-midnight border-white/5' : 'bg-gradient-to-br from-white to-slate-50 border-slate-100 shadow-lg'} border p-5 rounded-3xl relative overflow-hidden group`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
                                <div className="w-10 h-10 bg-neon-cyan/10 rounded-xl flex items-center justify-center text-neon-cyan mb-4 border border-neon-cyan/20">
                                    <FiBook size={20} />
                                </div>
                                <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-2`}>Knowledge Base</h4>
                                <p className="text-slate-500 text-[10px] mb-4 leading-relaxed line-clamp-2">Self-service documentation and video tutorials for all features.</p>

                                <div className="space-y-2 mb-4">
                                    {[
                                        { title: 'Getting Started Guide', link: '#' },
                                        { title: 'Project Management Tips', link: '#' },
                                        { title: 'Billing & Subscriptions', link: '#' }
                                    ].map((doc, idx) => (
                                        <a key={idx} href={doc.link} className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-neon-cyan transition-colors">
                                            <FiHelpCircle size={10} /> {doc.title}
                                        </a>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate('/docs')}
                                    className="w-full py-2.5 bg-slate-950/20 dark:bg-white/5 border border-white/10 hover:border-neon-cyan/30 text-neon-cyan text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                                >
                                    Browse Docs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Support;
