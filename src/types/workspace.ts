import type { PointEnd } from './geometry';

export type Step = 'upload' | 'calibrate' | 'measure';

export type ViewTool = 'rotate' | 'pan';

export type UploadPhase = 'idle' | 'preparing' | 'uploading' | 'converting';

/** What a point drag is moving: a calibration point or one end of a measurement. */
export type DragTarget =
  | { kind: 'calibration'; end: PointEnd }
  | { kind: 'measurement'; id: string; end: PointEnd };

export type HintTone = 'neutral' | 'active' | 'calibration' | 'success';

export interface Hint {
  text: string;
  tone: HintTone;
}
