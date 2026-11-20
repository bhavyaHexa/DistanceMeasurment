import type { Vec3 } from './geometry';

/** Which kind of geometry the cursor picks, like a CAD selection filter. */
export type SelectionFilter = 'point' | 'edge' | 'face';

/** Something on the model that can be hovered and selected. Coordinates are in scene units. */
export type SceneEntity =
  | { kind: 'point'; point: Vec3 }
  /** A continuous edge, as a polyline of two or more points. */
  | { kind: 'edge'; points: Vec3[] }
  /** A single mesh triangle. */
  | { kind: 'face'; corners: [Vec3, Vec3, Vec3] };

/** Right-click menu: where it opened and what lies under the cursor for each filter. */
export interface SelectionMenuState {
  /** Viewport (client) position of the click. */
  x: number;
  y: number;
  options: Partial<Record<SelectionFilter, SceneEntity>>;
}
