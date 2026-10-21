import type { Axis, Vec3 } from '@/types/geometry';
import type { MeasureMode } from '@/types/measurement';

const AXIS_INDEX: Record<Axis, number> = { x: 0, y: 1, z: 2 };

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function axisDelta(a: Vec3, b: Vec3, axis: Axis): number {
  const i = AXIS_INDEX[axis];
  return Math.abs(a[i] - b[i]);
}

/** Length of segment a→b in scene units, either straight-line or along one axis. */
export function segmentLength(a: Vec3, b: Vec3, mode: MeasureMode): number {
  return mode === 'euclidean' ? distance(a, b) : axisDelta(a, b, mode);
}

/**
 * Splits a→b into one leg per axis, walked Y then X then Z:
 * a → (a.x, b.y, a.z) → (b.x, b.y, a.z) → b.
 */
export function axisLegs(a: Vec3, b: Vec3): Record<Axis, [Vec3, Vec3]> {
  const afterY: Vec3 = [a[0], b[1], a[2]];
  const afterX: Vec3 = [b[0], b[1], a[2]];
  return { y: [a, afterY], x: [afterY, afterX], z: [afterX, b] };
}

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}
