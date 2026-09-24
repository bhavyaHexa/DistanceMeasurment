import type { LengthUnit } from '../types/measurement';

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
