import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStores } from '@/hooks/useStores';
import type { Vec3 } from '@/types/geometry';
import type { SelectionFilter, SelectionMenuState } from '@/types/selection';
import { pickEntity, pickModelPoint } from '@/utils/picking';

/** A press that moves less than this, and is released within CLICK_MAX_MS, counts as a click. */
const CLICK_TOLERANCE_PX = 15;
const CLICK_MAX_MS = 500;
/** Right-drag pans the camera, so a right-click must barely move to open the menu. */
const RIGHT_CLICK_TOLERANCE_PX = 5;

interface Press {
  x: number;
  y: number;
  time: number;
  pointerId: number;
}

const FILTERS: readonly SelectionFilter[] = ['point', 'edge', 'face'];

/**
 * Hover preview, click-to-place points and CAD-style selection for the model.
 *
 * Listens on the canvas instead of the mesh: a mesh handler needs both the press and the
 * release to land on a triangle, so clicks near silhouettes, thin edges or snap targets were
 * silently dropped. Here the point is resolved from the release position by our own raycast.
 *
 * While a point is being placed, a click places it. Otherwise (measuring) hovering previews and
 * clicking selects whatever the selection filter picks, and a right-click opens the selection menu.
 */
export function useModelPointer() {
  const { model, viewer, workspace, measurements, selection } = useStores();
  const { camera, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let press: Press | null = null;
    let rightPress: Press | null = null;
    /** Latest pointer position awaiting a hover pick; picks run at most once per frame. */
    let pendingMove: PointerEvent | null = null;
    let frame = 0;

    const pick = (event: PointerEvent): Vec3 | null =>
      model.scene ? pickModelPoint(event.clientX, event.clientY, camera, canvas, model.scene, viewer.snapToEdges) : null;

    const pickSelectable = (event: PointerEvent, filter: SelectionFilter) =>
      model.scene
        ? pickEntity(filter, event.clientX, event.clientY, camera, canvas, model.scene, viewer.snapToEdges)
        : null;

    const clearHover = () => {
      pendingMove = null;
      if (viewer.hoverPoint) viewer.setHoverPoint(null);
      if (selection.hover) selection.setHover(null);
    };

    const onMove = (event: PointerEvent) => {
      // A held button means the camera is orbiting/panning: skip the raycasts so it stays smooth.
      if (event.buttons !== 0 || viewer.isDragging) return clearHover();
      if (!workspace.isPlacingPoint && !selection.isActive) return clearHover();
      pendingMove = event;
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        const move = pendingMove;
        pendingMove = null;
        if (!move) return;
        if (workspace.isPlacingPoint) viewer.setHoverPoint(pick(move));
        else if (selection.isActive) selection.setHover(pickSelectable(move, selection.filter));
      });
    };

    const onLeave = clearHover;

    const onDown = (event: PointerEvent) => {
      const down = { x: event.clientX, y: event.clientY, time: Date.now(), pointerId: event.pointerId };
      if (event.button === 2) {
        rightPress = workspace.step === 'measure' ? down : null;
        return;
      }
      if (event.button !== 0 || !(workspace.isPlacingPoint || selection.isActive)) return;
      press = down;
    };

    const isClick = (event: PointerEvent, down: Press, tolerance: number) =>
      down.pointerId === event.pointerId &&
      Math.abs(event.clientX - down.x) < tolerance &&
      Math.abs(event.clientY - down.y) < tolerance &&
      Date.now() - down.time < CLICK_MAX_MS;

    const onUp = (event: PointerEvent) => {
      if (event.button === 2) {
        const down = rightPress;
        rightPress = null;
        if (!down || viewer.isDragging || !isClick(event, down, RIGHT_CLICK_TOLERANCE_PX)) return;
        const options: SelectionMenuState['options'] = {};
        for (const filter of FILTERS) {
          const entity = pickSelectable(event, filter);
          if (entity) options[filter] = entity;
        }
        selection.openMenu({ x: event.clientX, y: event.clientY, options });
        return;
      }

      const down = press;
      press = null;
      if (!down || viewer.isDragging || !isClick(event, down, CLICK_TOLERANCE_PX)) return;

      if (workspace.isPlacingPoint) {
        const point = pick(event);
        if (point) workspace.placePoint(point);
      } else if (selection.isActive) {
        const additive = event.ctrlKey || event.metaKey || event.shiftKey;
        const entity = pickSelectable(event, selection.filter);
        if (entity) selection.select(entity, additive);
        else if (!additive) selection.clearSelection();
      }
    };

    const onCancel = () => {
      press = null;
      rightPress = null;
    };

    // Right-click opens our menu, never the browser's.
    const onContextMenu = (event: Event) => event.preventDefault();

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onCancel);
    canvas.addEventListener('contextmenu', onContextMenu);
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [camera, gl, model, viewer, workspace, selection]);

  return {
    onPointerMissed() {
      if (workspace.step === 'measure') measurements.select(null);
    },
  };
}
