import React, { createContext, useContext, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    // Falling back to no-ops keeps components usable outside the provider
    // (e.g. in isolation) instead of throwing. Must cover every method the
    // real value exposes.
    return ctx || {
        toast: () => { }, dismiss: () => { },
        success: () => { }, error: () => { }, warning: () => { }, info: () => { },
    };
};

const ICONS = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
};

const TONES = {
    success: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    error: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    warning: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    info: 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10',
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message, { type = 'info', title, duration = 4500 } = {}) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts(prev => [...prev, { id, message, type, title }]);
        if (duration > 0) setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);

    const value = {
        toast,
        dismiss,
        success: (msg, opts) => toast(msg, { ...opts, type: 'success' }),
        error: (msg, opts) => toast(msg, { ...opts, type: 'error', duration: 7000 }),
        warning: (msg, opts) => toast(msg, { ...opts, type: 'warning' }),
        info: (msg, opts) => toast(msg, { ...opts, type: 'info' }),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-[min(360px,calc(100vw-3rem))] pointer-events-none">
                <AnimatePresence initial={false}>
                    {toasts.map(t => {
                        const Icon = ICONS[t.type] || FiInfo;
                        return (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl bg-slate-900/90 ${TONES[t.type] || TONES.info}`}
                            >
                                <Icon size={18} className="shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    {t.title && (
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">{t.title}</p>
                                    )}
                                    <p className="text-xs text-slate-200 leading-relaxed break-words">{t.message}</p>
                                </div>
                                <button
                                    onClick={() => dismiss(t.id)}
                                    className="shrink-0 text-slate-500 hover:text-white transition-colors"
                                    aria-label="Dismiss"
                                >
                                    <FiX size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastContext;
