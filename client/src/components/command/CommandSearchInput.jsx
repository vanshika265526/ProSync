import React, { forwardRef } from 'react';
import { FiSearch, FiLoader, FiX } from 'react-icons/fi';
import { Kbd } from '../ui/primitives';

/**
 * The palette's search field.
 *
 * Owns no state — the palette needs the raw value on every keystroke to run
 * its local fuzzy filter, so lifting it up is the simpler arrangement.
 * Arrow/Enter/Escape are handled by the palette and passed down via
 * `onKeyDown`, which keeps all navigation logic in one place.
 */
const CommandSearchInput = forwardRef(({
    value,
    onChange,
    onKeyDown,
    loading = false,
    dark = true,
    placeholder = 'Search anything...',
    activeDescendant,
}, ref) => (
    <div className={`flex items-center gap-3 px-5 h-[58px] border-b ${dark ? 'border-white/10' : 'border-slate-200'}`}>
        <span className={`shrink-0 ${loading ? 'text-neon-cyan' : 'text-slate-500'}`}>
            {loading ? <FiLoader size={17} className="animate-spin" /> : <FiSearch size={17} />}
        </span>

        <input
            ref={ref}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
            aria-label="Search commands, projects, tasks and members"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            className={`flex-1 bg-transparent outline-none text-sm font-medium min-w-0 ${dark
                ? 'text-white placeholder:text-slate-600'
                : 'text-slate-900 placeholder:text-slate-400'
                }`}
        />

        {value ? (
            <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Clear search"
                className="shrink-0 p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            >
                <FiX size={14} />
            </button>
        ) : (
            <Kbd dark={dark}>ESC</Kbd>
        )}
    </div>
));

CommandSearchInput.displayName = 'CommandSearchInput';

export default CommandSearchInput;
