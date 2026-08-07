import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX, FiGithub, FiCheckCircle, FiAlertCircle, FiStar, FiGitBranch, FiLoader,
} from 'react-icons/fi';
import { useDashboard } from '../../context/DashboardContext';
import { useGithub } from '../../context/GithubContext';
import githubService, { githubErrorMessage } from '../../services/githubService';
import { compact } from './githubUi';
import useModalDismiss from '../../hooks/useModalDismiss';

/**
 * Connect-repository modal.
 * Validates the input against the GitHub API as the user types (debounced),
 * shows a live preview card, and only enables Connect once the repo resolves.
 */
const GithubModal = ({ isOpen, onClose }) => {
    const { theme, authToken } = useDashboard();
    const { connect } = useGithub();

    // Click the backdrop or press Escape to dismiss.
    const { backdropProps } = useModalDismiss(isOpen, onClose);

    const [input, setInput] = useState('');
    const [preview, setPreview] = useState(null);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState('');
    const [connecting, setConnecting] = useState(false);

    const dark = theme === 'dark';
    const debounceRef = useRef(null);
    const requestIdRef = useRef(0);

    // Reset whenever the modal is re-opened.
    useEffect(() => {
        if (isOpen) {
            setInput('');
            setPreview(null);
            setError('');
            setValidating(false);
            setConnecting(false);
        }
    }, [isOpen]);

    // Debounced live validation.
    useEffect(() => {
        if (!isOpen) return;

        clearTimeout(debounceRef.current);
        const value = input.trim();

        if (!value) {
            setPreview(null);
            setError('');
            setValidating(false);
            return;
        }

        setValidating(true);
        setError('');

        debounceRef.current = setTimeout(async () => {
            const id = ++requestIdRef.current;
            try {
                const data = await githubService.validateRepository(value, authToken);
                if (id !== requestIdRef.current) return;   // a newer keystroke won
                setPreview(data.repository);
                setError('');
            } catch (err) {
                if (id !== requestIdRef.current) return;
                setPreview(null);
                setError(githubErrorMessage(err));
            } finally {
                if (id === requestIdRef.current) setValidating(false);
            }
        }, 550);

        return () => clearTimeout(debounceRef.current);
    }, [input, isOpen, authToken]);

    const handleConnect = async () => {
        if (!preview || connecting) return;
        setConnecting(true);
        setError('');
        try {
            await connect(input.trim());
            onClose();
        } catch (err) {
            setError(githubErrorMessage(err));
        } finally {
            setConnecting(false);
        }
    };

    const field = `w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all ${dark
        ? 'bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan/50'
        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-neon-cyan/50'
        }`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                    // Was a bare onClick={onClose}: selecting the repo text and
                    // releasing outside the card closed the dialog. The hook
                    // requires press and release to both land on the backdrop.
                    {...backdropProps}
                    role="presentation"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl relative overflow-hidden ${dark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'
                            }`}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-electric-purple" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-slate-500 hover:text-rose-500 transition-colors"
                            aria-label="Close"
                        >
                            <FiX size={22} />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${dark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                <FiGithub size={20} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                                    Connect Repository
                                </h2>
                                <p className="text-xs text-slate-500">Link a GitHub repo to this project</p>
                            </div>
                        </div>

                        <div className="mt-7">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2" htmlFor="repo-input">
                                Repository
                            </label>
                            <div className="relative">
                                <input
                                    id="repo-input"
                                    autoFocus
                                    className={field}
                                    placeholder="owner/repository  or  https://github.com/owner/repository"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && preview) handleConnect(); }}
                                />
                                {validating && (
                                    <FiLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-neon-cyan animate-spin" size={16} />
                                )}
                                {!validating && preview && (
                                    <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">
                                Both formats work. Public repositories require no extra setup.
                            </p>
                        </div>

                        {/* Live preview */}
                        <AnimatePresence mode="wait">
                            {preview && (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className={`p-5 rounded-2xl border ${dark ? 'bg-slate-950/50 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-500/20'}`}>
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={preview.avatar}
                                                alt={preview.owner}
                                                className="w-12 h-12 rounded-xl border border-white/10 shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className={`font-bold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                                                    {preview.repositoryName}
                                                </p>
                                                <p className="text-[11px] text-slate-500 truncate">{preview.fullName}</p>
                                                {preview.description && (
                                                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{preview.description}</p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] font-bold text-slate-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FiStar size={11} className="text-amber-400" /> {compact(preview.stars)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <FiGitBranch size={11} className="text-neon-cyan" /> {preview.defaultBranch}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md border ${preview.isPrivate
                                                        ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                                                        : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                                                        }`}>
                                                        {preview.isPrivate ? 'Private' : 'Public'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error */}
                        <AnimatePresence>
                            {error && !validating && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                                        <FiAlertCircle className="text-rose-400 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={onClose}
                                disabled={connecting}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all disabled:opacity-50 ${dark
                                    ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                                    : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConnect}
                                disabled={!preview || connecting || validating}
                                className="flex-1 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-electric-purple text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] transition-all disabled:opacity-40 disabled:hover:shadow-none"
                            >
                                {connecting
                                    ? <><FiLoader className="animate-spin" size={14} /> Connecting…</>
                                    : <><FiGithub size={14} /> Connect</>}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GithubModal;
