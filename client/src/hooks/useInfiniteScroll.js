import { useCallback, useEffect, useRef } from 'react';

/**
 * Fire `onLoadMore` when a sentinel element scrolls into view.
 *
 * Uses IntersectionObserver against the scroll container rather than a
 * scroll-position calculation, so it stays correct when the list is inside a
 * drawer, a panel, or the page itself.
 *
 * @param {Object} o
 * @param {boolean} o.hasMore
 * @param {boolean} o.loading
 * @param {Function} o.onLoadMore
 * @param {React.RefObject} [o.rootRef]  scroll container; defaults to viewport
 * @returns {Function} ref callback to attach to the sentinel element
 */
export const useInfiniteScroll = ({ hasMore, loading, onLoadMore, rootRef, rootMargin = '160px' }) => {
    const observerRef = useRef(null);
    const loadMoreRef = useRef(onLoadMore);
    loadMoreRef.current = onLoadMore;

    // Guards against a burst of intersections firing several loads for the
    // same page before `loading` has had a chance to flip.
    const inFlight = useRef(false);
    useEffect(() => { if (!loading) inFlight.current = false; }, [loading]);

    const sentinelRef = useCallback((node) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (!node || !hasMore) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !loading && !inFlight.current) {
                    inFlight.current = true;
                    loadMoreRef.current?.();
                }
            },
            { root: rootRef?.current || null, rootMargin, threshold: 0 }
        );

        observerRef.current.observe(node);
    }, [hasMore, loading, rootRef, rootMargin]);

    useEffect(() => () => observerRef.current?.disconnect(), []);

    return sentinelRef;
};

export default useInfiniteScroll;
