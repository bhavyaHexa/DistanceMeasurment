/**
 * Colours cycled through for measurements, indexed by `Measurement.colorIndex`.
 * Each is dark enough for white label text (WCAG AA).
 */
export const MEASURE_COLORS = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#c2410c', '#0e7490'] as const;

export const CALIBRATION_COLOR = '#f59e0b';

/** Axis guide colours, matching the viewport gizmo (X red, Y green, Z blue). */
export const AXIS_COLORS = { x: '#dc2626', y: '#16a34a', z: '#2563eb' } as const;

export function measureColor(colorIndex: number): string {
  return MEASURE_COLORS[colorIndex % MEASURE_COLORS.length];
}
