import { makeAutoObservable, observableShallow } from 'mobx';
import * as THREE from 'three';
import type { Measurement, InteractionMode, LengthUnit, MeasurementKind } from '../types/measurement';
import { makeId } from '../utils/ids';

export class MeasurementStore {
  mode: InteractionMode = 'idle';
  pendingPoints: THREE.Vector3[] = [];
  measurements: Measurement[] = [];

  scaleFactor: number | null = null; // real-world units per 1 scene unit
  unit: LengthUnit = 'in';
  calibrationId: string | null = null;

  /** Set while the calibration input field is waiting for a value. */
  pendingCalibrationRawDistance: number | null = null;

  constructor() {
    makeAutoObservable(this, {
      pendingPoints: observableShallow,
      measurements: observableShallow,
    });
  }

  startCalibration() {
    this.mode = 'placing-calibration';
    this.pendingPoints = [];
    this.pendingCalibrationRawDistance = null;
  }

  startMeasurement() {
    this.mode = 'placing-measurement';
    this.pendingPoints = [];
  }

  cancelPending() {
    this.mode = 'idle';
    this.pendingPoints = [];
    this.pendingCalibrationRawDistance = null;
  }

  /** Called from the canvas when a valid click lands on the model. */
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

    this.scaleFactor = knownDistance / this.pendingCalibrationRawDistance;
    const measurement = this._commit('calibration', a, b, this.pendingCalibrationRawDistance);
    this.calibrationId = measurement.id;
    this.cancelPending();
  }

  removeMeasurement(id: string) {
    this.measurements = this.measurements.filter((m) => m.id !== id);
    if (id === this.calibrationId) {
      this.calibrationId = null;
      this.scaleFactor = null;
    }
  }

  resetAll() {
    this.measurements = [];
    this.pendingPoints = [];
    this.scaleFactor = null;
    this.calibrationId = null;
    this.mode = 'idle';
    this.pendingCalibrationRawDistance = null;
  }

  setUnit(unit: LengthUnit) {
    this.unit = unit;
  }

  realDistanceOf(measurement: Measurement): number | null {
    return this.scaleFactor != null ? measurement.rawDistance * this.scaleFactor : null;
  }

  private _commit(
    kind: MeasurementKind,
    a: THREE.Vector3,
    b: THREE.Vector3,
    rawDistance: number,
  ): Measurement {
    const measurement: Measurement = {
      id: makeId(),
      kind,
      pointA: a,
      pointB: b,
      rawDistance,
      createdAt: Date.now(),
    };
    this.measurements.push(measurement);
    return measurement;
  }
}
