import type { Vec3 } from './geometry';
import type { MeasureMode, Unit } from './measurement';

/**
 * Shape of the metadata JSON saved with a run. Older saves may lack optional fields;
 * `parseProjectFile` fills in defaults so those projects still open.
 */
export interface SavedCalibration {
  calA: Vec3 | null;
  calB: Vec3 | null;
  calLength: number | null;
  calUnit: Unit;
}

export interface SavedMeasurement {
  id: string;
  name: string;
  colorIndex: number;
  visible: boolean;
  a: Vec3 | null;
  b: Vec3 | null;
  selectedAxis?: MeasureMode;
  createdAt?: number;
}

/**
 * Saves before 2 stored points in the unrotated model frame (Z-up exports stood on the X-Y plane).
 * Version 2 stores points after the model is oriented with Y up.
 */
export const SAVE_VERSION = 2;

export interface SavedMeasurementData {
  version: 1 | typeof SAVE_VERSION;
  calibration: SavedCalibration;
  measurements: SavedMeasurement[];
  nextColorIndex: number;
}

export interface ProjectFile {
  projectName: string;
  savedAt: string;
  measurementData: SavedMeasurementData;
  displayUnit: Unit;
}
