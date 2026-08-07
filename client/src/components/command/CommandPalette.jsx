import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FiClock, FiSearch, FiCheckSquare, FiFolder, FiFileText, FiUser, FiCommand, FiTrash2,
} from 'react-icons/fi';

import { useDashboard } from '../../context/DashboardContext';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import useHotkey from '../../hooks/useHotkey';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import searchService from '../../services/searchService';
import { fuzzyFilter } from '../../utils/fuzzySearch';
import { buildCommands, GROUPS } from './commandRegistry';
import CommandSearchInput from './CommandSearchInput';
import SearchCommandItem from './SearchCommandItem';
import { EmptyState, Kbd, Skeleton } from '../ui/primitives';

/**
 * Global command palette (Feature 1) — Ctrl/Cmd + K.
 *
 * Results come from two places and are merged into one flat, keyboard-
 * navigable list:
 *   - static commands, fuzzy-matched locally so typing never waits on a
 *     network round-trip
 *   - entities (tasks/projects/notes/members) from /api/search/global, fetched
 *     on a debounce
 *
 * Rendered through a portal so the backdrop blur sits above the app chrome
 * regardless of where the provider ends up in the tree.
 */

const ENTITY_META = {
    task: { icon: FiCheckSquare, tone: 'text-neon-cyan', bg: 'bg-neon-cyan/10', group: 'Tasks' },
    project: { icon: FiFolder, tone: 'text-electric-purple', bg: 'bg-electric-purple/10', group: 'Projects' },
    note: { icon: FiFileText, tone: 'text-sky-400', bg: 'bg-sky-500/10', group: 'Notes' },
    member: { icon: FiUser, tone: 'text-amber-400', bg: 'bg-amber-500/10', group: 'Members' },
};

const RECENT_ICON = { command: FiCommand, task: FiCheckSquare, project: FiFolder, note: FiFileText, member: FiUser };

const CommandPalette = () => {
    const navigate = useNavigate();
    const {
        theme, toggleTheme, authToken, isDemoMode, currentUserRole,
        projects, activeProjectId, setActiveProjectId, tasks, notes,
    } = useDashboard();
    const { isOpen, open, close, run, initialQuery } = useCommandPalette();

    const dark = theme === 'dark';
    const inputRef = useRef(null);
    const listRef = useRef(null);
    // Restores focus to whatever was focused before the palette opened.
    const restoreFocusRef = useRef(null);

    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scope, setScope] = useState(null);          // set by a "Search X" command
    const [remote, setRemote] = useState({ projects: [], tasks: [], notes: [], members: [] });
    const [recents, setRecents] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebouncedValue(query, 220);

    // --- Global shortcut -----------------------------------------------------
    useHotkey('mod+k', () => (isOpen ? close() : open()), { allowInInput: true });

    // --- Open / close lifecycle ---------------------------------------------
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setScope(null);
            setSelectedIndex(0);
            // Hand focus back where it came from — required for keyboard users.
            restoreFocusRef.current?.focus?.();
            restoreFocusRef.current = null;
            return;
        }

        restoreFocusRef.current = document.activeElement;
        setQuery(initialQuery || '');
        setSelectedIndex(0);

        // Autofocus after the open animation has committed.
        const timer = setTimeout(() => inputRef.current?.focus(), 40);
        return () => clearTimeout(timer);
    }, [isOpen, initialQuery]);

    // Lock body scroll while the modal is up.
    useEffect(() => {
        if (!isOpen) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [isOpen]);

    // --- Recents ------------------------------------------------------------
    const loadRecents = useCallback(async () => {
        if (!authToken || isDemoMode) return;
        try {
            setRecents(await searchService.getRecents(authToken));
        } catch { /* recents are a nicety, never block the palette on them */ }
    }, [authToken, isDemoMode]);

    useEffect(() => { if (isOpen) loadRecents(); }, [isOpen, loadRecents]);

    const rememberSelection = useCallback((entry) => {
        if (!authToken || isDemoMode) return;
        searchService.addRecent(entry, authToken)
            .then(() => loadRecents())
            .catch(() => { /* non-fatal */ });
    }, [authToken, isDemoMode, loadRecents]);

    const clearRecents = useCallback(async () => {
        setRecents([]);
        if (!authToken || isDemoMode) return;
        try { await searchService.clearRecents(authToken); } catch { loadRecents(); }
    }, [authToken, isDemoMode, loadRecents]);

    // --- Remote search ------------------------------------------------------
    useEffect(() => {
        if (!isOpen || !authToken || isDemoMode) return undefined;

        const controller = new AbortController();
        setLoading(true);

        searchService
            .globalSearch(debouncedQuery, authToken, { limit: 6, signal: controller.signal })
            .then((data) => setRemote({
                projects: data.projects || [],
                tasks: data.tasks || [],
                notes: data.notes || [],
                members: data.members || [],
            }))
            .catch(() => { /* fall back to whatever is already in local state */ })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [debouncedQuery, isOpen, authToken, isDemoMode]);

    // --- Command catalogue --------------------------------------------------
    const activeProject = useMemo(
        () => projects.find((p) => p._id === activeProjectId) || projects[0] || null,
        [projects, activeProjectId]
    );

    const commands = useMemo(() => buildCommands({
        run,
        navigate,
        close,
        isAdmin: currentUserRole === 'Admin',
        hasRepo: !!activeProject?.github?.connected,
        repoUrl: activeProject?.github?.repositoryUrl,
        theme,
        toggleTheme,
    }), [run, navigate, close, currentUserRole, activeProject, theme, toggleTheme]);

    // --- Result assembly ----------------------------------------------------
    //
    // Demo mode has no API, so entity results fall back to whatever the
    // dashboard already holds in memory.
    const localEntities = useMemo(() => {
        if (!isDemoMode) return null;
        return {
            projects: projects.map((p) => ({ id: p._id, type: 'project', label: p.name, subtitle: p.type, projectId: p._id })),
            tasks: tasks.map((t) => ({ id: t._id, type: 'task', label: t.title, subtitle: t.status, projectId: t.projectId })),
            notes: notes.map((n) => ({ id: n._id, type: 'note', label: n.title, subtitle: (n.content || '').slice(0, 60) })),
            members: [],
        };
    }, [isDemoMode, projects, tasks, notes]);

    const entities = localEntities || remote;

    const openEntity = useCallback((entity) => {
        rememberSelection({
            key: `${entity.type}:${entity.id}`,
            label: entity.label,
            subtitle: entity.subtitle,
            kind: entity.type,
            projectId: entity.projectId,
        });

        close();

        switch (entity.type) {
            case 'project':
                setActiveProjectId(entity.id);
                navigate('/dashboard');
                break;
            case 'task':
                if (entity.projectId) setActiveProjectId(entity.projectId);
                navigate('/dashboard');
                run('set-tab', 'List');
                run('focus-task', entity.id);
                break;
            case 'note':
                navigate('/dashboard');
                run('set-tab', 'Notes');
                break;
            case 'member':
                navigate(`/profile/${entity.id}`);
                break;
            default:
                break;
        }
    }, [close, navigate, setActiveProjectId, run, rememberSelection]);

    /**
     * The flat list the keyboard walks, plus the group headings used to
     * render it. Built together so index math can never drift from what's
     * on screen.
     */
    const { sections, flat } = useMemo(() => {
        const result = [];

        // Scoped mode: one entity type only, no commands.
        if (scope) {
            const meta = ENTITY_META[scope];
            const items = fuzzyFilter(query, entities[`${scope}s`] || [], (e) => [e.label, e.subtitle], { limit: 12 });
            result.push({
                title: meta.group,
                items: items.map((e) => ({
                    key: `${e.type}:${e.id}`,
                    label: e.label,
                    subtitle: e.subtitle,
                    icon: meta.icon,
                    iconTone: meta.tone,
                    iconBg: meta.bg,
                    matchIndices: e._matchIndices,
                    onSelect: () => openEntity(e),
                })),
            });
        } else {
            // Commands first — they're what the palette is for.
            const matched = fuzzyFilter(
                query,
                commands,
                (c) => [c.label, c.subtitle, ...(c.keywords || [])],
                { limit: query ? 14 : 40 }
            );

            const byGroup = new Map();
            for (const command of matched) {
                if (!byGroup.has(command.group)) byGroup.set(command.group, []);
                byGroup.get(command.group).push(command);
            }

            for (const [title, items] of byGroup) {
                result.push({
                    title,
                    items: items.map((c) => ({
                        key: c.id,
                        label: c.label,
                        subtitle: c.subtitle,
                        icon: c.icon,
                        iconTone: c.iconTone,
                        iconBg: c.iconBg,
                        matchIndices: c._matchIndices,
                        badge: c.scope ? 'Scope' : undefined,
                        onSelect: () => {
                            if (c.scope) {
                                // Scope commands narrow the palette instead of
                                // navigating — keep it open and clear the query.
                                setScope(c.scope);
                                setQuery('');
                                setSelectedIndex(0);
                                inputRef.current?.focus();
                                return;
                            }
                            rememberSelection({
                                key: c.id, label: c.label, subtitle: c.subtitle, kind: 'command', action: c.id,
                            });
                            c.run?.();
                        },
                    })),
                });
            }

            // Then matching entities, grouped by type.
            if (query) {
                for (const type of ['project', 'task', 'note', 'member']) {
                    const meta = ENTITY_META[type];
                    const pool = entities[`${type}s`] || [];
                    const items = fuzzyFilter(query, pool, (e) => [e.label, e.subtitle], { limit: 5 });
                    if (items.length === 0) continue;

                    result.push({
                        title: meta.group,
                        items: items.map((e) => ({
                            key: `${e.type || type}:${e.id}`,
                            label: e.label,
                            subtitle: e.subtitle,
                            icon: meta.icon,
                            iconTone: meta.tone,
                            iconBg: meta.bg,
                            matchIndices: e._matchIndices,
                            onSelect: () => openEntity({ ...e, type: e.type || type }),
                        })),
                    });
                }
            }

            // Recents only make sense on an empty query.
            if (!query && recents.length > 0) {
                result.push({
                    title: GROUPS.RECENT,
                    action: { label: 'Clear', icon: FiTrash2, onClick: clearRecents },
                    items: recents.map((r) => {
                        const Icon = RECENT_ICON[r.kind] || FiClock;
                        return {
                            key: `recent:${r.key}`,
                            label: r.label,
                            subtitle: r.subtitle,
                            icon: Icon,
                            iconTone: 'text-slate-400',
                            iconBg: 'bg-white/5',
                            onSelect: () => {
                                // A recent command replays the live command (so
                                // its handler is always current); a recent entity
                                // re-opens the entity.
                                const [kind, id] = String(r.key).split(':');
                                if (r.kind === 'command') {
                                    const command = commands.find((c) => c.id === r.key);
                                    if (command?.run) { command.run(); return; }
                                }
                                openEntity({ type: r.kind, id: id || r.key, label: r.label, subtitle: r.subtitle, projectId: r.projectId });
                            },
                        };
                    }),
                });
            }
        }

        const flatList = result.flatMap((section) => section.items);
        return { sections: result, flat: flatList };
    }, [scope, query, commands, entities, recents, openEntity, rememberSelection, clearRecents]);

    // Keep the cursor inside the list as results change under it.
    useEffect(() => {
        setSelectedIndex((i) => (flat.length === 0 ? 0 : Math.min(i, flat.length - 1)));
    }, [flat.length]);

    // --- Keyboard navigation -------------------------------------------------
    const onKeyDown = useCallback((event) => {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex((i) => (flat.length ? (i + 1) % flat.length : 0));
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
                break;
            case 'Home':
                event.preventDefault();
                setSelectedIndex(0);
                break;
            case 'End':
                event.preventDefault();
                setSelectedIndex(Math.max(0, flat.length - 1));
                break;
            case 'Enter':
                event.preventDefault();
                flat[selectedIndex]?.onSelect?.();
                break;
            case 'Escape':
                event.preventDefault();
                // Escape backs out of a scope first, then closes.
                if (scope) { setScope(null); setQuery(''); } else close();
                break;
            case 'Backspace':
                // Backspacing on an empty scoped query drops the scope.
                if (scope && query === '') { event.preventDefault(); setScope(null); }
                break;
            default:
                break;
        }
    }, [flat, selectedIndex, scope, query, close]);

    if (!isOpen) return null;

    // Index offset per section, so a flat cursor maps onto grouped rendering.
    let cursor = -1;

    return createPortal(
        <AnimatePresence>
            <motion.div
                key="command-palette"
                className="fixed inset-0 z-[300] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                    onClick={close}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />

                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Command palette"
                    initial={{ opacity: 0, y: -12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className={`relative w-full max-w-[640px] rounded-2xl overflow-hidden border backdrop-blur-2xl
                        shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7)] ${dark
                            ? 'bg-slate-900/90 border-white/10'
                            : 'bg-white/95 border-slate-200'
                        }`}
                >
                    {/* Gradient hairline */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent" />

                    {scope && (
                        <div className={`flex items-center gap-2 px-5 pt-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                                {ENTITY_META[scope]?.group}
                            </span>
                            <span className="text-[10px]">Press <Kbd dark={dark}>ESC</Kbd> to exit this scope</span>
                        </div>
                    )}

                    <CommandSearchInput
                        ref={inputRef}
                        value={query}
                        onChange={(v) => { setQuery(v); setSelectedIndex(0); }}
                        onKeyDown={onKeyDown}
                        loading={loading && !!query}
                        dark={dark}
                        placeholder={scope ? `Search ${ENTITY_META[scope]?.group?.toLowerCase()}...` : 'Search anything...'}
                        activeDescendant={flat[selectedIndex] ? `cmd-${selectedIndex}` : undefined}
                    />

                    <div
                        ref={listRef}
                        id="command-palette-list"
                        role="listbox"
                        aria-label="Results"
                        className="max-h-[52vh] overflow-y-auto custom-scrollbar py-2 px-2"
                    >
                        {flat.length === 0 ? (
                            loading ? (
                                <div className="px-3 py-4"><Skeleton lines={4} dark={dark} /></div>
                            ) : (
                                <EmptyState
                                    icon={FiSearch}
                                    title="No results"
                                    description={`Nothing matches "${query}". Try a different search or press Escape to close.`}
                                    dark={dark}
                                />
                            )
                        ) : (
                            sections.map((section) => (
                                <div key={section.title} className="mb-1.5 last:mb-0">
                                    <div className="flex items-center justify-between px-3 pt-2 pb-1">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            {section.title}
                                        </span>
                                        {section.action && (
                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); section.action.onClick(); }}
                                                className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-600 hover:text-rose-400 transition-colors"
                                            >
                                                <section.action.icon size={9} /> {section.action.label}
                                            </button>
                                        )}
                                    </div>

                                    {section.items.map((item) => {
                                        cursor += 1;
                                        const index = cursor;
                                        return (
                                            <SearchCommandItem
                                                key={item.key}
                                                id={`cmd-${index}`}
                                                icon={item.icon}
                                                iconTone={item.iconTone}
                                                iconBg={item.iconBg}
                                                label={item.label}
                                                subtitle={item.subtitle}
                                                badge={item.badge}
                                                matchIndices={item.matchIndices}
                                                selected={index === selectedIndex}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                onSelect={item.onSelect}
                                                dark={dark}
                                            />
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer legend */}
                    <div className={`flex items-center justify-between gap-4 px-5 py-2.5 border-t text-[10px] ${dark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'
                        }`}>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Kbd dark={dark}>↑</Kbd><Kbd dark={dark}>↓</Kbd> navigate</span>
                            <span className="flex items-center gap-1"><Kbd dark={dark}>↵</Kbd> select</span>
                            <span className="hidden sm:flex items-center gap-1"><Kbd dark={dark}>ESC</Kbd> close</span>
                        </div>
                        <span className="hidden sm:flex items-center gap-1.5 font-bold">
                            <FiCommand size={10} className="text-neon-cyan" /> ProSync
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default CommandPalette;
