import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useThree } from '@react-three/fiber';
import { useStores } from '@/hooks/useStores';
import type { Vec3 } from '@/types/geometry';
import type { DragTarget } from '@/types/workspace';
import { pickModelPoint } from '@/utils/picking';

/** Returns a pointer-down handler that drags `target` across the model surface. */
export function usePointDrag(target: DragTarget, position: Vec3) {
  const { model, viewer } = useStores();
  const { camera, gl } = useThree();
  /** Ends this marker's drag; set while a drag is in progress. */
  const stopDrag = useRef<(() => void) | null>(null);

  // A marker can unmount mid-drag (e.g. its measurement is deleted); end its drag cleanly.
  useEffect(() => () => stopDrag.current?.(), []);

  return (event: ReactPointerEvent) => {
    event.stopPropagation();
    viewer.startDrag(target, position);

    let pendingMove: PointerEvent | null = null;
    let frame = 0;
    const applyPending = () => {
      const latest = pendingMove;
      pendingMove = null;
      if (!latest || !model.scene) return;
      const point = pickModelPoint(latest.clientX, latest.clientY, camera, gl.domElement, model.scene, viewer.snapToEdges);
      if (point) viewer.dragTo(point);
    };
    // Pointer events can outpace the screen; resolve only the latest position once per frame.
    const onMove = (move: PointerEvent) => {
      pendingMove = move;
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        applyPending();
      });
    };
    const onEnd = () => {
      cancelAnimationFrame(frame);
      applyPending(); // keep the final position if the release beat the next frame
      stopDrag.current = null;
      viewer.endDrag();
      gl.domElement.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };

    stopDrag.current = onEnd;
    gl.domElement.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    // A cancelled pointer (interrupted touch, browser gesture) never fires pointerup —
    // without this the drag stays active and the camera controls stay disabled.
    window.addEventListener('pointercancel', onEnd);
  };
}
