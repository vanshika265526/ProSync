import { useEffect, useState } from 'react';

/**
 * Trailing-edge debounce for a value.
 *
 * Used to keep the palette's local fuzzy filter instant (it runs on the raw
 * value) while the network search only fires once typing settles.
 */
export const useDebouncedValue = (value, delay = 250) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
};

export default useDebouncedValue;
