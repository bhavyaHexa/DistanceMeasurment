import type { MeasureMode } from '@/types/measurement';

/** The distances a scale can be based on: `title` for pickers, `name` for use in sentences. */
export const CALIBRATION_MODES: readonly { mode: MeasureMode; title: string; name: string }[] = [
  { mode: 'euclidean', title: 'Absolute distance', name: 'absolute' },
  { mode: 'x', title: 'Horizontal scaling', name: 'horizontal' },
  { mode: 'y', title: 'Vertical scaling', name: 'vertical' },
  { mode: 'z', title: 'Depth scaling', name: 'depth' },
];

export function calibrationMode(mode: MeasureMode) {
  return CALIBRATION_MODES.find((m) => m.mode === mode) ?? CALIBRATION_MODES[0];
}
