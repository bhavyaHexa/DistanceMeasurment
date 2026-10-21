import type { Vec3 } from '@/types/geometry';
import type { MeasureMode, Unit } from '@/types/measurement';
import type { ProjectFile, SavedCalibration, SavedMeasurement, SavedMeasurementData } from '@/types/projectFile';
import { makeId } from './ids';
import { UNITS } from './units';

const MEASURE_MODES: readonly MeasureMode[] = ['euclidean', 'x', 'y', 'z'];

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null;

const isVec3 = (value: unknown): value is Vec3 =>
  Array.isArray(value) && value.length === 3 && value.every((n) => typeof n === 'number');

const isUnit = (value: unknown): value is Unit => UNITS.includes(value as Unit);

const asVec3 = (value: unknown): Vec3 | null => (isVec3(value) ? value : null);

function parseCalibration(raw: unknown): SavedCalibration {
  const c = isObject(raw) ? raw : {};
  return {
    calA: asVec3(c.calA),
    calB: asVec3(c.calB),
    calLength: typeof c.calLength === 'number' ? c.calLength : null,
    calUnit: isUnit(c.calUnit) ? c.calUnit : 'in',
  };
}

function parseMeasurement(raw: unknown): SavedMeasurement | null {
  if (!isObject(raw)) return null;
  return {
    id: typeof raw.id === 'string' ? raw.id : makeId(),
    name: typeof raw.name === 'string' ? raw.name : 'Measurement',
    colorIndex: typeof raw.colorIndex === 'number' ? raw.colorIndex : 0,
    visible: raw.visible !== false,
    a: asVec3(raw.a),
    b: asVec3(raw.b),
    selectedAxis: MEASURE_MODES.includes(raw.selectedAxis as MeasureMode)
      ? (raw.selectedAxis as MeasureMode)
      : undefined,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : undefined,
  };
}

/** Reads saved metadata defensively, so older or partial saves still open. */
export function parseProjectFile(raw: unknown): { data: SavedMeasurementData; displayUnit: Unit | null } | null {
  if (!isObject(raw) || !isObject(raw.measurementData)) return null;
  const data = raw.measurementData;
  return {
    data: {
      version: 1,
      calibration: parseCalibration(data.calibration),
      measurements: Array.isArray(data.measurements)
        ? data.measurements.map(parseMeasurement).filter((m): m is SavedMeasurement => m !== null)
        : [],
      nextColorIndex: typeof data.nextColorIndex === 'number' ? data.nextColorIndex : 0,
    },
    displayUnit: isUnit(raw.displayUnit) ? raw.displayUnit : null,
  };
}

export function buildProjectFile(projectName: string, data: SavedMeasurementData, displayUnit: Unit): ProjectFile {
  return { projectName, savedAt: new Date().toISOString(), measurementData: data, displayUnit };
}
