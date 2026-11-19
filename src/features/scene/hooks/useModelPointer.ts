import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStores } from '@/hooks/useStores';
import type { Vec3 } from '@/types/geometry';
import { pickModelPoint } from '@/utils/picking';

/** A press that moves less than this, and is released within CLICK_MAX_MS, counts as a click. */
const CLICK_TOLERANCE_PX = 15;
const CLICK_MAX_MS = 500;

interface Press {
  x: number;
  y: number;
  time: number;
  pointerId: number;
}

/**
 * Hover preview and click-to-place points for the model.
 *
 * Listens on the canvas instead of the mesh: a mesh handler needs both the press and the
 * release to land on a triangle, so clicks near silhouettes, thin edges or snap targets were
 * silently dropped. Here the point is resolved from the release position by our own raycast.
 */
export function useModelPointer() {
  const { model, viewer, workspace, measurements } = useStores();
  const { camera, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let press: Press | null = null;

    const pick = (event: PointerEvent): Vec3 | null =>
      model.scene ? pickModelPoint(event.clientX, event.clientY, camera, canvas, model.scene, viewer.snapToEdges) : null;

    const onMove = (event: PointerEvent) => {
      if (viewer.isDragging || !workspace.isPlacingPoint) return viewer.setHoverPoint(null);
      viewer.setHoverPoint(pick(event));
    };

    const onLeave = () => viewer.setHoverPoint(null);

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || !workspace.isPlacingPoint) return;
      press = { x: event.clientX, y: event.clientY, time: Date.now(), pointerId: event.pointerId };
    };

    const onUp = (event: PointerEvent) => {
      const down = press;
      press = null;
      if (!down || down.pointerId !== event.pointerId || viewer.isDragging) return;
      const isClick =
        Math.abs(event.clientX - down.x) < CLICK_TOLERANCE_PX &&
        Math.abs(event.clientY - down.y) < CLICK_TOLERANCE_PX &&
        Date.now() - down.time < CLICK_MAX_MS;
      if (!isClick) return;
      const point = pick(event);
      if (point) workspace.placePoint(point);
    };

    const onCancel = () => {
      press = null;
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onCancel);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
    };
  }, [camera, gl, model, viewer, workspace]);

  return {
    onPointerMissed() {
      if (workspace.step === 'measure') measurements.select(null);
    },
  };
}
