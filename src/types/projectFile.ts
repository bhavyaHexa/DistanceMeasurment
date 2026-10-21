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

export interface SavedMeasurementData {
  version: 1;
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
