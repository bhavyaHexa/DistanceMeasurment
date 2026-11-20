import type { CSSProperties } from 'react';

/**
 * Style for drei `<Html>` overlays that must never intercept the mouse. Html's own `pointerEvents`
 * prop is ignored unless `transform` is on, so without this the overlay sits over the canvas: the
 * cursor "leaves" the canvas whenever it is over the overlay, and hover/click handling stops.
 */
export const HTML_PASS_THROUGH: CSSProperties = { pointerEvents: 'none' };
