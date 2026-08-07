import { useCallback, useEffect, useRef } from 'react';

/**
 * Standard dismiss behaviour for modal dialogs: click the backdrop to close,
 * press Escape to close.
 *
 * Spread the returned `backdropProps` onto the full-screen overlay element.
 * Nothing needs to go on the panel — the handlers compare `event.target` to
 * `event.currentTarget`, so a click that started anywhere inside the dialog
 * simply isn't a backdrop click.
 *
 * The mousedown/click pairing is the part that matters. Listening on `click`
 * alone means selecting text inside the dialog and releasing the mouse over
 * the backdrop closes it and throws away what you typed. Requiring the press
 * *and* the release to both land on the backdrop fixes that.
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {Object}   [options]
 * @param {boolean}  [options.closeOnOutside=true]
 * @param {boolean}  [options.closeOnEscape=true]
 * @param {boolean}  [options.lockScroll=true]   prevent the page behind scrolling
 */
export const useModalDismiss = (isOpen, onClose, options = {}) => {
    const {
        closeOnOutside = true,
        closeOnEscape = true,
        lockScroll = true,
    } = options;

    // Tracks whether the press that began this click landed on the backdrop.
    const pressedBackdrop = useRef(false);

    // Held in a ref so an inline arrow function as `onClose` doesn't rebind
    // the Escape listener on every render.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                event.stopPropagation();
                onCloseRef.current?.();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, closeOnEscape]);

    useEffect(() => {
        if (!isOpen || !lockScroll) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [isOpen, lockScroll]);

    const onMouseDown = useCallback((event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
    }, []);

    const onClick = useCallback((event) => {
        const releasedOnBackdrop = event.target === event.currentTarget;
        const shouldClose = closeOnOutside && releasedOnBackdrop && pressedBackdrop.current;
        pressedBackdrop.current = false;
        if (shouldClose) onCloseRef.current?.();
    }, [closeOnOutside]);

    return {
        backdropProps: { onMouseDown, onClick },
    };
};

export default useModalDismiss;
