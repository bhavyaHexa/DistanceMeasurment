import * as THREE from 'three';

export type MeasurementKind = 'calibration' | 'measurement';

export interface Measurement {
  id: string;
  kind: MeasurementKind;
  pointA: THREE.Vector3;
  pointB: THREE.Vector3;
  /** Euclidean distance between pointA/pointB in raw Three.js scene units. */
  rawDistance: number;
  createdAt: number;
  /** Optional user-editable name, e.g. "Bolt spacing". */
  label?: string;
}

export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft';

export type InteractionMode =
  | 'idle'
  | 'placing-calibration'
  | 'placing-measurement';
