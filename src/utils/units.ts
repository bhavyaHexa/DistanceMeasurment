import type { Unit, Vec3, LengthUnit } from '../types/measurement';

// --- NEW API per Spec §8 ---

export const TO_METERS = { mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048 } as const;
export const DECIMALS = { mm: 1, cm: 1, m: 2, in: 1, ft: 2 } as const;

export function distance(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function toUnit(sceneDist: number, mPerUnit: number, unit: Unit) {
  return (sceneDist * mPerUnit) / TO_METERS[unit];
}

export function format(v: number, unit: Unit) {
  return `${v.toFixed(DECIMALS[unit])} ${unit}`;
}

export function axisDeltas(a: Vec3, b: Vec3) {
  return {
    dx: Math.abs(a[0] - b[0]),
    dy: Math.abs(a[1] - b[1]),
    dz: Math.abs(a[2] - b[2]),
  };
}

// --- OLD API wrappers to keep app compiling until Layer 5 ---

const MM_PER_UNIT: Record<LengthUnit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
};

export function convert(valueInMm: number, toUnit: LengthUnit): number {
  return valueInMm / MM_PER_UNIT[toUnit];
}

export function toMm(value: number, fromUnit: LengthUnit): number {
  return value * MM_PER_UNIT[fromUnit];
}

export function formatDistance(valueInMm: number | null, unit: LengthUnit): string {
  if (valueInMm == null) return '—';
  const converted = convert(valueInMm, unit);
  const decimals = unit === 'm' || unit === 'ft' ? 3 : 2;
  return `${converted.toFixed(decimals)} ${unit}`;
}
