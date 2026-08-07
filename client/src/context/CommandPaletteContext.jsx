import React, { createContext, useContext, useCallback, useMemo, useRef, useState } from 'react';

/**
 * Open/close state plus an action registry for the command palette.
 *
 * The registry exists because the palette lives near the root of the tree but
 * most of its commands ("Create Task", "Sync Repository") need handlers that
 * only the dashboard owns. Rather than drill props or lift modal state up,
 * Home registers named handlers on mount and the palette calls them by name.
 *
 * Handlers live in a ref, so registering one never triggers a re-render of
 * everything below the provider.
 */

const CommandPaletteContext = createContext(null);

export const useCommandPalette = () => useContext(CommandPaletteContext) || {
    isOpen: false, open: () => { }, close: () => { }, toggle: () => { },
    registerAction: () => () => { }, registerActions: () => () => { }, run: () => { },
    initialQuery: '',
};

export const CommandPaletteProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [initialQuery, setInitialQuery] = useState('');
    const actionsRef = useRef(new Map());

    const open = useCallback((query = '') => {
        setInitialQuery(query);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((v) => !v), []);

    /** Register one handler. Returns an unregister function. */
    const registerAction = useCallback((name, handler) => {
        if (!name || typeof handler !== 'function') return () => { };
        actionsRef.current.set(name, handler);
        return () => {
            // Only remove it if it's still ours — a remount may have replaced it.
            if (actionsRef.current.get(name) === handler) actionsRef.current.delete(name);
        };
    }, []);

    /** Register a whole map at once. Returns a single unregister function. */
    const registerActions = useCallback((map = {}) => {
        const disposers = Object.entries(map).map(([name, handler]) => registerAction(name, handler));
        return () => disposers.forEach((dispose) => dispose());
    }, [registerAction]);

    /** Invoke a registered handler. Unknown names warn rather than throw. */
    const run = useCallback((name, ...args) => {
        const handler = actionsRef.current.get(name);
        if (!handler) {
            console.warn(`[CommandPalette] no handler registered for "${name}"`);
            return undefined;
        }
        return handler(...args);
    }, []);

    const value = useMemo(() => ({
        isOpen, open, close, toggle, registerAction, registerActions, run, initialQuery,
    }), [isOpen, open, close, toggle, registerAction, registerActions, run, initialQuery]);

    return (
        <CommandPaletteContext.Provider value={value}>
            {children}
        </CommandPaletteContext.Provider>
    );
};

export default CommandPaletteContext;
