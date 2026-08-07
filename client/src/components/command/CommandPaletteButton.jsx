import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { useDashboard } from '../../context/DashboardContext';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { Kbd } from '../ui/primitives';

/**
 * Search affordance in the header.
 *
 * Renders as a wide "Search anything… ⌘K" pill on desktop and collapses to a
 * plain icon button below `sm`, where there's no keyboard to advertise.
 */
const CommandPaletteButton = ({ className = '' }) => {
    const { theme } = useDashboard();
    const { open } = useCommandPalette();
    const dark = theme === 'dark';

    // navigator.platform is deprecated but still the most reliable signal
    // available for choosing between ⌘ and Ctrl in the hint.
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');

    return (
        <>
            {/* Desktop */}
            <button
                type="button"
                onClick={() => open()}
                aria-label="Open command palette"
                aria-keyshortcuts="Control+K Meta+K"
                className={`hidden md:flex items-center gap-2 h-9 pl-3 pr-2 rounded-xl border transition-all shadow-xl group
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${dark
                        ? 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300 hover:border-neon-cyan/40'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-neon-cyan/40'
                    } ${className}`}
            >
                <FiSearch size={13} className="group-hover:text-neon-cyan transition-colors" />
                {/* Fixed width keeps the pill from resizing between breakpoints;
                    the label is hidden on narrower desktops to save room. */}
                <span className="text-[10.5px] font-medium w-[86px] text-left hidden lg:block">Search anything...</span>
                <span className="flex items-center gap-0.5">
                    <Kbd dark={dark}>{isMac ? '⌘' : 'Ctrl'}</Kbd>
                    <Kbd dark={dark}>K</Kbd>
                </span>
            </button>

            {/* Mobile */}
            <button
                type="button"
                onClick={() => open()}
                aria-label="Open command palette"
                className={`md:hidden w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-xl ${dark
                    ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/50'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/50'
                    } ${className}`}
            >
                <FiSearch size={16} />
            </button>
        </>
    );
};

export default CommandPaletteButton;
