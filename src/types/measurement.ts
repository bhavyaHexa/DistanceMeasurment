import type { Axis, Vec3 } from './geometry';

export type Unit = 'mm' | 'cm' | 'm' | 'in' | 'ft';

/** Which length of a measurement is reported: the straight line, or one axis component. */
export type MeasureMode = 'euclidean' | Axis;

export interface Measurement {
  id: string;
  name: string;
  /** Start point in scene units; null until placed. */
  a: Vec3 | null;
  /** End point in scene units; null until placed. */
  b: Vec3 | null;
  colorIndex: number;
  visible: boolean;
  selectedAxis: MeasureMode;
  createdAt: number;
}

export interface CalibrationPoints {
  a: Vec3 | null;
  b: Vec3 | null;
}
