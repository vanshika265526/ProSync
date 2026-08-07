import React, { useEffect, useRef } from 'react';
import { FiCornerDownLeft } from 'react-icons/fi';
import { highlightSegments } from '../../utils/fuzzySearch';
import { Kbd } from '../ui/primitives';

/**
 * One selectable row in the command palette.
 *
 * Two things are load-bearing here:
 *   1. `onMouseDown` (not onClick) fires the action — the input is focused,
 *      and mousedown runs before the blur, so the palette can't close out
 *      from under the click.
 *   2. When selected, it scrolls itself into view with `block: 'nearest'`,
 *      which is what makes arrow-key navigation feel native.
 */
const SearchCommandItem = ({
    id,
    icon: Icon,
    iconTone = 'text-slate-400',
    iconBg = 'bg-white/5',
    label,
    subtitle,
    badge,
    matchIndices = [],
    selected = false,
    onSelect,
    onMouseEnter,
    dark = true,
    trailing,
}) => {
    const ref = useRef(null);

    useEffect(() => {
        if (selected) ref.current?.scrollIntoView({ block: 'nearest' });
    }, [selected]);

    const segments = highlightSegments(label, matchIndices);

    return (
        <div
            ref={ref}
            id={id}
            role="option"
            aria-selected={selected}
            onMouseEnter={onMouseEnter}
            // See note above: mousedown beats blur.
            onMouseDown={(e) => { e.preventDefault(); onSelect?.(); }}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                transition-colors duration-100 relative ${selected
                    ? dark
                        ? 'bg-white/[0.07] ring-1 ring-neon-cyan/25'
                        : 'bg-slate-100 ring-1 ring-neon-cyan/30'
                    : 'hover:bg-white/[0.03]'
                }`}
        >
            {selected && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-neon-cyan shadow-[0_0_10px_#00F2EA]" />
            )}

            {Icon && (
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconTone}`}>
                    <Icon size={15} />
                </span>
            )}

            <span className="flex-1 min-w-0">
                <span className={`block text-[13px] font-semibold truncate ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {segments.map((seg, i) =>
                        seg.match ? (
                            <mark key={i} className="bg-transparent text-neon-cyan font-black">{seg.text}</mark>
                        ) : (
                            <React.Fragment key={i}>{seg.text}</React.Fragment>
                        )
                    )}
                </span>
                {subtitle && (
                    <span className="block text-[10.5px] text-slate-500 truncate mt-0.5">{subtitle}</span>
                )}
            </span>

            {badge && (
                <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-500 border border-white/5">
                    {badge}
                </span>
            )}

            {trailing}

            <span className={`shrink-0 transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}>
                <Kbd dark={dark}><FiCornerDownLeft size={9} className="inline" /></Kbd>
            </span>
        </div>
    );
};

export default SearchCommandItem;
