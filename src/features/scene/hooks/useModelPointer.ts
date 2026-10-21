import { useRef } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { useStores } from '@/hooks/useStores';
import type { Vec3 } from '@/types/geometry';
import { findSnap } from '@/utils/snap';

/** A press that moves less than this, and is released within CLICK_MAX_MS, counts as a click. */
const CLICK_TOLERANCE_PX = 15;
const CLICK_MAX_MS = 500;

interface Press {
  x: number;
  y: number;
  time: number;
  point: Vec3;
}

/** Pointer handlers for the model mesh: hover preview and click-to-place points. */
export function useModelPointer() {
  const { model, viewer, workspace, measurements } = useStores();
  const canvas = useThree((state) => state.gl.domElement);
  const press = useRef<Press | null>(null);

  const resolvePoint = (event: ThreeEvent<PointerEvent>): Vec3 => {
    if (viewer.snapToEdges && model.scene) {
      // Also catches the near edge when the cursor slips just past a silhouette.
      const snap = findSnap(event.clientX, event.clientY, event.camera, canvas, model.scene);
      if (snap) return snap.point.toArray();
    }
    return event.point.toArray();
  };

  return {
    onPointerMove(event: ThreeEvent<PointerEvent>) {
      if (viewer.isDragging) return;
      if (!workspace.isPlacingPoint) return viewer.setHoverPoint(null);
      event.stopPropagation();
      viewer.setHoverPoint(resolvePoint(event));
    },

    onPointerLeave() {
      viewer.setHoverPoint(null);
    },

    onPointerDown(event: ThreeEvent<PointerEvent>) {
      // R3F fires once per intersected mesh, nearest first — keep only the nearest.
      event.stopPropagation();
      if (!workspace.isPlacingPoint) return;
      // Resolve where the user aimed at press time; the cursor may drift before release.
      press.current = { x: event.clientX, y: event.clientY, time: Date.now(), point: resolvePoint(event) };
    },

    onPointerUp(event: ThreeEvent<PointerEvent>) {
      const down = press.current;
      press.current = null;
      if (!down) return;
      const isClick =
        Math.abs(event.clientX - down.x) < CLICK_TOLERANCE_PX &&
        Math.abs(event.clientY - down.y) < CLICK_TOLERANCE_PX &&
        Date.now() - down.time < CLICK_MAX_MS;
      if (!isClick) return;
      event.stopPropagation();
      workspace.placePoint(down.point);
    },

    onPointerMissed() {
      if (workspace.step === 'measure') measurements.select(null);
    },
  };
}
