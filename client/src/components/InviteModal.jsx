<<<<<<< HEAD
import React, { useState } from 'react';
import { FiX, FiMail, FiCopy, FiCheck, FiSend, FiShare2 } from 'react-icons/fi';
import { FaWhatsapp, FaTelegramPlane, FaLinkedinIn } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE } from '../services/apiClient';
import useModalDismiss from '../hooks/useModalDismiss';

const InviteModal = ({ isOpen, onClose, activeProjectId, projectName }) => {
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState(''); // '', 'sending', 'sent', 'error'
    const [message, setMessage] = useState('');

    // Click the backdrop or press Escape to dismiss.
    // Must run before the early return so hook order stays stable.
    const { backdropProps } = useModalDismiss(isOpen, onClose);

    if (!isOpen) return null;

    const inviteLink = activeProjectId
        ? `${window.location.origin}/signup?join=${activeProjectId}`
        : `${window.location.origin}/signup`;
    const shareText = projectName
        ? `Join my project "${projectName}" on ProSync: ${inviteLink}`
        : `Hey! I'm using ProSync to manage my projects. Join me and let's collaborate: ${inviteLink}`;

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('sending');
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await axios.post(`${API_BASE}/invite/send`,
                { email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus('sent');
            setMessage('Invitation sent to ' + email);
            setEmail('');
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to send invitation');
        }
    };

    const shareSocial = (platform) => {
        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink)}`;
                break;
            default:
                break;
        }
        if (url) window.open(url, '_blank');
    };

    return (
        <div
            {...backdropProps}
            role="presentation"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-500"
        >
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 overflow-hidden group">
                {/* Decorative gradients */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-cyan/10 blur-[80px] rounded-full group-hover:bg-neon-cyan/20 transition-all duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-electric-purple/10 blur-[80px] rounded-full group-hover:bg-electric-purple/20 transition-all duration-700"></div>

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10">
                    <FiX size={20} />
                </button>

                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-neon-cyan mb-6 border border-white/5 shadow-inner">
                        <FiShare2 size={24} />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Invite <span className="text-neon-cyan">Friends</span></h3>
                    <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">Expand your team and collaborate on ambitious projects in real-time.</p>

                    <form onSubmit={handleSendInvite} className="mb-8">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Send invitations via Email</label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-neon-cyan" />
                                <input
                                    required
                                    type="email"
                                    placeholder="colleague@company.com"
                                    className="w-full bg-slate-950/30 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all text-xs"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                disabled={status === 'sending'}
                                className="px-5 bg-gradient-to-r from-neon-cyan to-electric-purple text-midnight font-black rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {status === 'sending' ? 'Sending...' : <><FiSend /> Invite</>}
                            </button>
                        </div>
                        {status === 'sent' && <p className="text-emerald-400 text-[10px] mt-2 font-bold animate-in fade-in slide-in-from-top-1">{message}</p>}
                        {status === 'error' && <p className="text-rose-400 text-[10px] mt-2 font-bold animate-in fade-in slide-in-from-top-1">{message}</p>}
                    </form>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Quick Referral Link</label>
                                <button
                                    onClick={copyLink}
                                    className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${copied ? 'text-emerald-400' : 'text-neon-cyan hover:text-white'}`}
                                >
                                    {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Link</>}
                                </button>
                            </div>
                            <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-center justify-between group/link hover:border-white/10 transition-all cursor-pointer" onClick={copyLink}>
                                <span className="text-[10px] text-slate-400 font-medium truncate italic">{inviteLink}</span>
                                <FiShare2 className="text-slate-600 group-hover/link:text-neon-cyan transition-colors" size={12} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Or share through platforms</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => shareSocial('whatsapp')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group/social"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/social:scale-110 transition-transform">
                                        <FaWhatsapp size={20} />
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp</span>
                                </button>

                                <button
                                    onClick={() => shareSocial('telegram')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all group/social"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover/social:scale-110 transition-transform">
                                        <FaTelegramPlane size={20} />
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Telegram</span>
                                </button>

                                <button
                                    onClick={() => shareSocial('linkedin')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group/social"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover/social:scale-110 transition-transform">
                                        <FaLinkedinIn size={20} />
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">LinkedIn</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
=======
import React, { useState } from 'react';
import { FiX, FiMail, FiCopy, FiCheck, FiSend, FiShare2 } from 'react-icons/fi';
import { FaWhatsapp, FaTelegramPlane, FaLinkedinIn } from 'react-icons/fa';
import axios from 'axios';

const InviteModal = ({ isOpen, onClose, activeProjectId, projectName }) => {
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState(''); // '', 'sending', 'sent', 'error'
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const inviteLink = activeProjectId
        ? `${window.location.origin}/signup?join=${activeProjectId}`
        : `${window.location.origin}/signup`;
    const shareText = projectName
        ? `Join my project "${projectName}" on ProSync: ${inviteLink}`
        : `Hey! I'm using ProSync to manage my projects. Join me and let's collaborate: ${inviteLink}`;

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('sending');
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await axios.post('http://localhost:5001/api/invite/send',
                { email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus('sent');
            setMessage('Invitation sent to ' + email);
            setEmail('');
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to send invitation');
        }
    };

    const shareSocial = (platform) => {
        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink)}`;
                break;
            default:
                break;
        }
        if (url) window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-500">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 overflow-hidden group">
                {/* Decorative gradients */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-cyan/10 blur-[80px] rounded-full group-hover:bg-neon-cyan/20 transition-all duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-electric-purple/10 blur-[80px] rounded-full group-hover:bg-electric-purple/20 transition-all duration-700"></div>

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10">
                    <FiX size={20} />
                </button>

                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-neon-cyan mb-6 border border-white/5 shadow-inner">
                        <FiShare2 size={24} />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Invite <span className="text-neon-cyan">Friends</span></h3>
                    <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">Expand your team and collaborate on ambitious projects in real-time.</p>

                    <form onSubmit={handleSendInvite} className="mb-8">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Send invitations via Email</label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-neon-cyan" />
                                <input
                                    required
                                    type="email"
                                    placeholder="colleague@company.com"
                                    className="w-full bg-slate-950/30 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all text-xs"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                disabled={status === 'sending'}
                                className="px-5 bg-gradient-to-r from-neon-cyan to-electric-purple text-midnight font-black rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {status === 'sending' ? 'Sending...' : <><FiSend /> Invite</>}
                            </button>
                        </div>
                        {status === 'sent' && <p className="text-emerald-400 text-[10px] mt-2 font-bold animate-in fade-in slide-in-from-top-1">{message}</p>}
                        {status === 'error' && <p className="text-rose-400 text-[10px] mt-2 font-bold animate-in fade-in slide-in-from-top-1">{message}</p>}
                    </form>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Quick Referral Link</label>
                                <button
                                    onClick={copyLink}
                                    className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${copied ? 'text-emerald-400' : 'text-neon-cyan hover:text-white'}`}
                                >
                                    {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Link</>}
                                </button>
                            </div>
                            <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-center justify-between group/link hover:border-white/10 transition-all cursor-pointer" onClick={copyLink}>
                                <span className="text-[10px] text-slate-400 font-medium truncate italic">{inviteLink}</span>
                                <FiShare2 className="text-slate-600 group-hover/link:text-neon-cyan transition-colors" size={12} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Or share through platforms</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => shareSocial('whatsapp')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group/social"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/social:scale-110 transition-transform">
                                        <FaWhatsapp size={20} />
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp</span>
                                </button>

                                <button
                                    onClick={() => shareSocial('telegram')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all group/social"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover/social:scale-110 transition-transform">
                                        <FaTelegramPlane size={20} />
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Telegram</span>
                                </button>

                                <button
                                    onClick={() => shareSocial('linkedin')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group/social"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover/social:scale-110 transition-transform">
                                        <FaLinkedinIn size={20} />
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">LinkedIn</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
