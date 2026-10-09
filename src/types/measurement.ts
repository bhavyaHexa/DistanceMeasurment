export type Step = 'load' | 'calibrate' | 'measure';
export type Unit = 'mm' | 'cm' | 'm' | 'in' | 'ft';
export type Vec3 = [number, number, number];

export interface Measurement {
  id: string;
  name: string;        // default "Measurement N"
  a: Vec3;             // scene units
  b: Vec3;             // scene units
  colorIndex: number;  // index into MEASURE_COLORS
  visible: boolean;    // default true
  selectedAxis?: 'euclidean' | 'x' | 'y' | 'z';
  
  // Keep old fields optionally for Layer 1-4 compatibility
  kind?: MeasurementKind;
  pointA?: any;
  pointB?: any;
  rawDistance: number;
}

// Keeping old types temporarily for old UI to compile until Layer 5
export type MeasurementKind = 'calibration' | 'measurement';
export type InteractionMode = 'idle' | 'placing-calibration' | 'placing-measurement';
export type LengthUnit = Unit;
