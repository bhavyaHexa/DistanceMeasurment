import type { Vec3 } from '@/types/geometry';
import type { SceneEntity } from '@/types/selection';
import { distance } from './geometry';

const round = (value: number) => value.toFixed(4);
const roundPoint = (p: Vec3) => p.map(round).join(',');

/** Identity of an entity, so the same thing picked twice counts as one. */
export function entityKey(entity: SceneEntity): string {
  switch (entity.kind) {
    case 'point':
      return `point:${roundPoint(entity.point)}`;
    case 'edge': {
      const ends = [entity.points[0], entity.points[entity.points.length - 1]].map(roundPoint).sort();
      return `edge:${ends.join('|')}:${entity.points.length}`;
    }
    case 'face':
      return `face:${entity.corners.map(roundPoint).sort().join('|')}`;
  }
}

/** Total length of a polyline, in scene units. */
export function polylineLength(points: Vec3[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
  return total;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function between(from: Vec3, to: Vec3): Vec3 {
  return [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
}

/** Area of a triangle, in squared scene units. */
export function triangleArea([a, b, c]: [Vec3, Vec3, Vec3]): number {
  return Math.hypot(...cross(between(a, b), between(a, c))) / 2;
}

/** Unit normal of a triangle (by corner winding), or [0, 0, 0] for a degenerate one. */
export function triangleNormal([a, b, c]: [Vec3, Vec3, Vec3]): Vec3 {
  const n = cross(between(a, b), between(a, c));
  const length = Math.hypot(...n);
  return length === 0 ? [0, 0, 0] : [n[0] / length, n[1] / length, n[2] / length];
}
