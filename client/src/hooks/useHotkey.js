import { useEffect, useRef } from 'react';

/**
 * Bind a global keyboard shortcut.
 *
 * Two details that matter for a Ctrl+K palette:
 *   - the handler lives in a ref, so passing an inline arrow function doesn't
 *     rebind the listener on every render
 *   - keystrokes typed into an input/textarea/contenteditable are ignored
 *     unless `allowInInput` is set, so typing "k" in a task title never opens
 *     the palette
 *
 * @param {string|string[]} combo  e.g. 'mod+k', 'escape', ['mod+k', 'ctrl+/']
 * @param {Function} handler
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true]
 * @param {boolean} [options.allowInInput=false]
 * @param {boolean} [options.preventDefault=true]
 */
export const useHotkey = (combo, handler, options = {}) => {
    const { enabled = true, allowInInput = false, preventDefault = true } = options;
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled) return undefined;

        const combos = (Array.isArray(combo) ? combo : [combo]).map((c) =>
            c.toLowerCase().split('+').map((p) => p.trim())
        );

        const isEditable = (el) => {
            if (!el) return false;
            const tag = el.tagName;
            return (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                tag === 'SELECT' ||
                el.isContentEditable === true
            );
        };

        const matches = (event, parts) => {
            const key = parts[parts.length - 1];
            const modifiers = parts.slice(0, -1);

            // 'mod' is Cmd on macOS, Ctrl everywhere else.
            const needMod = modifiers.includes('mod');
            const needCtrl = modifiers.includes('ctrl');
            const needMeta = modifiers.includes('cmd') || modifiers.includes('meta');
            const needShift = modifiers.includes('shift');
            const needAlt = modifiers.includes('alt');

            if (needMod && !(event.ctrlKey || event.metaKey)) return false;
            if (needCtrl && !event.ctrlKey) return false;
            if (needMeta && !event.metaKey) return false;
            if (needShift !== event.shiftKey) return false;
            if (needAlt !== event.altKey) return false;
            // A bare shortcut must not fire while a modifier is held.
            if (!needMod && !needCtrl && !needMeta && (event.ctrlKey || event.metaKey)) return false;

            const pressed = (event.key || '').toLowerCase();
            return pressed === key || (key === 'escape' && pressed === 'esc');
        };

        const onKeyDown = (event) => {
            if (!allowInInput && isEditable(event.target)) return;

            for (const parts of combos) {
                if (matches(event, parts)) {
                    if (preventDefault) event.preventDefault();
                    handlerRef.current?.(event);
                    return;
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [combo, enabled, allowInInput, preventDefault]);
};

export default useHotkey;
