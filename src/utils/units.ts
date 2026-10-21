import type { Unit } from '@/types/measurement';

export const UNITS: readonly Unit[] = ['m', 'cm', 'mm', 'ft', 'in'];

const METERS_PER_UNIT: Record<Unit, number> = { mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048 };
const DECIMALS: Record<Unit, number> = { mm: 1, cm: 1, m: 2, in: 1, ft: 2 };

export function toMeters(value: number, unit: Unit): number {
  return value * METERS_PER_UNIT[unit];
}

/** Converts a scene-space length into `unit`, given the calibrated scale. */
export function sceneToUnit(sceneLength: number, metersPerSceneUnit: number, unit: Unit): number {
  return (sceneLength * metersPerSceneUnit) / METERS_PER_UNIT[unit];
}

export function roundForUnit(value: number, unit: Unit): string {
  return value.toFixed(DECIMALS[unit]);
}

export function formatLength(value: number, unit: Unit): string {
  return `${roundForUnit(value, unit)} ${unit}`;
}
