import { makeAutoObservable, observableShallow } from 'mobx';
import * as THREE from 'three';
import { makeId } from '../utils/ids';
import { TO_METERS, distance, toUnit, format } from '../utils/units';
import type { Measurement, Vec3, Unit, InteractionMode, MeasurementKind, LengthUnit } from '../types/measurement';

type HistoryAction = 
  | { type: 'placePoint'; measurement: Measurement }
  | { type: 'placeCalPoint'; prevDraft: { a: Vec3 | null; b: Vec3 | null } }
  | { type: 'remove'; measurement: Measurement; index: number }
  | { type: 'movePoint'; id: string | 'cal'; end: 'a' | 'b'; prevPos: Vec3 }
  | { type: 'clearAll'; measurements: Measurement[] };

export class MeasurementStore {
  // --- New Calibration Fields ---
  calA: Vec3 | null = null;
  calB: Vec3 | null = null;
  calLength: number | null = null;
  calUnit: Unit = 'in';
  calDraft: { a: Vec3 | null; b: Vec3 | null } = { a: null, b: null };

  // --- New Measurement Fields ---
  measurements: Measurement[] = [];
  pendingA: Vec3 | null = null;
  hoverPoint: Vec3 | null = null;
  selectedId: string | null = null;
  nextColorIndex: number = 0;
  draggingId: string | null = null;

  // History stack
  history: HistoryAction[] = [];

  // --- Old Fields (Compatibility) ---
  mode: InteractionMode = 'idle';
  pendingPoints: THREE.Vector3[] = [];
  scaleFactor: number | null = null; 
  unit: LengthUnit = 'in';
  calibrationId: string | null = null;
  pendingCalibrationRawDistance: number | null = null;

  constructor() {
    makeAutoObservable(this, {
      measurements: observableShallow,
      history: observableShallow,
      pendingPoints: observableShallow,
    });
  }

  // --- New Computed ---
  get metersPerSceneUnit(): number | null {
    if (!this.calA || !this.calB || !this.calLength) return null;
    const dist = distance(this.calA, this.calB);
    if (dist === 0) return null;
    return (this.calLength * TO_METERS[this.calUnit]) / dist;
  }

  get isCalibrated(): boolean {
    return this.metersPerSceneUnit !== null;
  }

  get selected(): Measurement | null {
    return this.measurements.find((m) => m.id === this.selectedId) || null;
  }

  // --- New Calibration Actions ---
  placeCalPoint(p: Vec3) {
    this.history.push({ type: 'placeCalPoint', prevDraft: { ...this.calDraft } });
    if (this.history.length > 20) this.history.shift();

    if (!this.calDraft.a) {
      this.calDraft.a = p;
    } else if (!this.calDraft.b) {
      this.calDraft.b = p;
    } else {
      this.calDraft.b = p;
    }
  }

  repickCal(which: 'a' | 'b') {
    this.history.push({ type: 'placeCalPoint', prevDraft: { ...this.calDraft } });
    if (this.history.length > 20) this.history.shift();
    if (which === 'a') this.calDraft.a = null;
    if (which === 'b') this.calDraft.b = null;
  }

  applyCalibration(length: number, unit: Unit) {
    if (!this.calDraft.a || !this.calDraft.b) return;
    this.calA = this.calDraft.a;
    this.calB = this.calDraft.b;
    this.calLength = length;
    this.calUnit = unit;
  }

  startRecalibration() {
    this.calDraft = { a: this.calA, b: this.calB };
  }

  cancelCalibration() {
    this.calDraft = { a: null, b: null };
  }

  resetCalibration() {
    this.calA = null;
    this.calB = null;
    this.calLength = null;
    this.calUnit = 'in';
    this.calDraft = { a: null, b: null };
  }

  // --- New Measurement Actions ---
  placePoint(p: Vec3) {
    if (!this.pendingA) {
      this.pendingA = p;
    } else {
      const measurement: Measurement = {
        id: makeId(),
        name: `Measurement ${this.measurements.length + 1}`,
        a: this.pendingA,
        b: p,
        colorIndex: this.nextColorIndex,
        visible: true,
        rawDistance: distance(this.pendingA, p),
      };
      this.measurements.push(measurement);
      this.nextColorIndex = (this.nextColorIndex + 1) % 6;
      this.pendingA = null;
      this.selectedId = measurement.id;

      this.history.push({ type: 'placePoint', measurement });
      if (this.history.length > 20) this.history.shift();
    }
  }

  cancelPending() {
    this.pendingA = null;
    // Old compat
    this.mode = 'idle';
    this.pendingPoints = [];
    this.pendingCalibrationRawDistance = null;
  }

  setHoverPoint(p: Vec3 | null) {
    this.hoverPoint = p;
  }

  select(id: string | null) {
    this.selectedId = id;
  }

  rename(id: string, name: string) {
    const m = this.measurements.find(x => x.id === id);
    if (m) m.name = name;
  }

  toggleVisible(id: string) {
    const m = this.measurements.find(x => x.id === id);
    if (m) m.visible = !m.visible;
  }

  remove(id: string) {
    const index = this.measurements.findIndex((m) => m.id === id);
    if (index >= 0) {
      const measurement = this.measurements[index];
      this.history.push({ type: 'remove', measurement, index });
      if (this.history.length > 20) this.history.shift();
      this.measurements.splice(index, 1);
      if (this.selectedId === id) this.selectedId = null;
    }
  }

  clearAll() {
    if (this.measurements.length > 0) {
      this.history.push({ type: 'clearAll', measurements: [...this.measurements] });
      if (this.history.length > 20) this.history.shift();
      this.measurements = [];
      this.selectedId = null;
    }
  }

  movePoint(id: string | 'cal', end: 'a' | 'b' | 'A' | 'B', p: Vec3 | THREE.Vector3) {
    const vec: Vec3 = Array.isArray(p) ? p : [p.x, p.y, p.z];
    const endLower = end.toLowerCase() as 'a' | 'b';
    if (id === 'cal') {
      if (endLower === 'a' && this.calDraft.a) {
        this.calDraft.a = vec;
      } else if (endLower === 'b' && this.calDraft.b) {
        this.calDraft.b = vec;
      }
    } else {
      const m = this.measurements.find(x => x.id === id);
      if (m) {
        if (endLower === 'a') m.a = vec;
        if (endLower === 'b') m.b = vec;
      }
    }
  }

  setDragging(id: string | null) {
    this.draggingId = id;
  }

  undo() {
    const action = this.history.pop();
    if (!action) return;

    if (action.type === 'placePoint') {
      this.measurements = this.measurements.filter(m => m.id !== action.measurement.id);
      if (this.selectedId === action.measurement.id) this.selectedId = null;
    } else if (action.type === 'placeCalPoint') {
      this.calDraft = { ...action.prevDraft };
    } else if (action.type === 'remove') {
      this.measurements.splice(action.index, 0, action.measurement);
    } else if (action.type === 'movePoint') {
      this.movePoint(action.id, action.end, action.prevPos);
    } else if (action.type === 'clearAll') {
      this.measurements = action.measurements;
    }
  }

  displayValue(m: Measurement, unit: Unit): string {
    const mps = this.metersPerSceneUnit;
    if (mps === null) return '—';
    const sceneDist = distance(m.a, m.b);
    return format(toUnit(sceneDist, mps, unit), unit);
  }

  exportCsv(unit: Unit): string {
    let csv = 'name,value,unit,dx,dy,dz,ax,ay,az,bx,by,bz\n';
    const mps = this.metersPerSceneUnit;
    for (const m of this.measurements) {
      if (!m.visible) continue;
      const sceneDist = distance(m.a, m.b);
      const val = mps !== null ? toUnit(sceneDist, mps, unit).toFixed(TO_METERS[unit]) : '';
      csv += `"${m.name}",${val},${unit},${Math.abs(m.a[0] - m.b[0])},${Math.abs(m.a[1] - m.b[1])},${Math.abs(m.a[2] - m.b[2])},${m.a[0]},${m.a[1]},${m.a[2]},${m.b[0]},${m.b[1]},${m.b[2]}\n`;
    }
    return csv;
  }

  // --- Old Methods (Compatibility until Layer 5) ---
  startCalibration() {
    this.mode = 'placing-calibration';
    this.pendingPoints = [];
    this.pendingCalibrationRawDistance = null;
  }

  startMeasurement() {
    this.mode = 'placing-measurement';
    this.pendingPoints = [];
  }

  addPoint(point: THREE.Vector3) {
    if (this.mode === 'idle') return;
    this.pendingPoints.push(point.clone());
    if (this.pendingPoints.length < 2) return;

    const [a, b] = this.pendingPoints;
    const rawDistance = a.distanceTo(b);

    if (this.mode === 'placing-calibration') {
      this.pendingCalibrationRawDistance = rawDistance;
    } else {
      this._commit('measurement', a, b, rawDistance);
      this.cancelPending();
    }
  }

  completeCalibration(knownDistance: number) {
    if (this.pendingCalibrationRawDistance == null || knownDistance <= 0) return;
    const [a, b] = this.pendingPoints;

    if (this.calibrationId) {
      this.measurements = this.measurements.filter((m) => m.id !== this.calibrationId);
    }

    const knownDistanceInMm = (knownDistance * TO_METERS[this.unit]) / 0.001;
    this.scaleFactor = knownDistanceInMm / this.pendingCalibrationRawDistance;
    const measurement = this._commit('calibration', a, b, this.pendingCalibrationRawDistance);
    this.calibrationId = measurement.id;
    this.cancelPending();
  }

  removeMeasurement(id: string) {
    this.remove(id);
    // Old compat
    if (id === this.calibrationId) {
      this.calibrationId = null;
      this.scaleFactor = null;
    }
  }

  resetAll() {
    this.clearAll();
    // Old compat
    this.pendingPoints = [];
    this.scaleFactor = null;
    this.calibrationId = null;
    this.mode = 'idle';
    this.pendingCalibrationRawDistance = null;
  }

  setUnit(unit: LengthUnit) {
    this.unit = unit;
  }

  realDistanceOf(measurement: any): number | null {
    return this.scaleFactor != null ? measurement.rawDistance * this.scaleFactor : null;
  }

  private _commit(
    kind: MeasurementKind,
    a: THREE.Vector3,
    b: THREE.Vector3,
    rawDistance: number,
  ): any {
    const measurement: any = {
      id: makeId(),
      kind,
      pointA: a,
      pointB: b,
      rawDistance,
      createdAt: Date.now(),
      a: [a.x, a.y, a.z],
      b: [b.x, b.y, b.z],
      name: `Measurement ${this.measurements.length + 1}`,
      colorIndex: this.nextColorIndex,
      visible: true
    };
    this.measurements.push(measurement);
    this.nextColorIndex = (this.nextColorIndex + 1) % 6;
    return measurement;
  }
}
