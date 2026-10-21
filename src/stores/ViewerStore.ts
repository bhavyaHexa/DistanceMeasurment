import { makeAutoObservable, observableRef } from 'mobx';
import type { Vec3 } from '@/types/geometry';
import type { DragTarget, ViewTool } from '@/types/workspace';
import type { RootStore } from './RootStore';

interface ActiveDrag {
  target: DragTarget;
  start: Vec3;
  current: Vec3;
}

/** 3D viewport interaction: camera tool, snapping, hover preview and point dragging. */
export class ViewerStore {
  viewTool: ViewTool = 'rotate';
  snapToEdges = true;
  /** Incremented to ask the camera to frame the model. */
  fitRequest = 0;
  /** Where the next click would land, shown as a snap ring while placing points. */
  hoverPoint: Vec3 | null = null;
  drag: ActiveDrag | null = null;

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root'>(
      this,
      { root: false, hoverPoint: observableRef, drag: observableRef },
      { autoBind: true },
    );
  }

  get isDragging(): boolean {
    return this.drag !== null;
  }

  get cursor(): 'grabbing' | 'crosshair' | 'default' {
    if (this.isDragging) return 'grabbing';
    return this.root.workspace.isPlacingPoint ? 'crosshair' : 'default';
  }

  /** The snap ring is shown only while a click would place a point. */
  get snapPreview(): Vec3 | null {
    return this.snapToEdges && !this.isDragging && this.root.workspace.isPlacingPoint ? this.hoverPoint : null;
  }

  isDraggingMeasurement(id: string): boolean {
    return this.drag?.target.kind === 'measurement' && this.drag.target.id === id;
  }

  setViewTool(tool: ViewTool) {
    this.viewTool = tool;
  }

  setSnapToEdges(enabled: boolean) {
    this.snapToEdges = enabled;
  }

  requestFit() {
    this.fitRequest++;
  }

  setHoverPoint(point: Vec3 | null) {
    this.hoverPoint = point;
  }

  startDrag(target: DragTarget, start: Vec3) {
    this.drag = { target, start, current: start };
  }

  dragTo(point: Vec3) {
    if (!this.drag) return;
    this.drag = { ...this.drag, current: point };
    this.movePoint(this.drag.target, point);
  }

  /** Finishes a drag and makes it undoable. */
  endDrag() {
    const drag = this.drag;
    this.drag = null;
    if (!drag || drag.current === drag.start) return;
    this.root.history.push(() => this.movePoint(drag.target, drag.start));
  }

  reset() {
    this.hoverPoint = null;
    this.drag = null;
  }

  private movePoint(target: DragTarget, point: Vec3) {
    if (target.kind === 'calibration') {
      this.root.calibration.moveDraftPoint(target.end, point);
    } else {
      this.root.measurements.movePoint(target.id, target.end, point);
    }
  }
}
