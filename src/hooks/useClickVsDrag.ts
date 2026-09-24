import { useRef, useCallback } from 'react';

const DRAG_THRESHOLD_PX = 6;

export function useClickVsDrag(onRealClick: (e: any) => void) {
  const downPos = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback((e: any) => {
    downPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(
    (e: any) => {
      if (!downPos.current) return;
      const dx = e.clientX - downPos.current.x;
      const dy = e.clientY - downPos.current.y;
      downPos.current = null;
      if (Math.hypot(dx, dy) <= DRAG_THRESHOLD_PX) {
        onRealClick(e);
      }
    },
    [onRealClick],
  );

  return { onPointerDown, onPointerUp };
}
