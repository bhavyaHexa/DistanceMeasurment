import type { Measurement, Unit } from '@/types/measurement';
import { axisDelta, distance } from './geometry';
import { sceneToUnit } from './units';

interface MeasurementsCsvInput {
  measurements: readonly Measurement[];
  metersPerSceneUnit: number | null;
  unit: Unit;
  calibration: { length: number; unit: Unit } | null;
}

const HEADER = 'name,value,unit,dx,dy,dz,ax,ay,az,bx,by,bz';

function quote(text: string): string {
  return `"${text.replace(/"/g, '""')}"`;
}

/** CSV of every visible, completed measurement. Lengths are in `unit`; points stay in scene units. */
export function buildMeasurementsCsv({
  measurements,
  metersPerSceneUnit,
  unit,
  calibration,
}: MeasurementsCsvInput): string {
  const toUnit = (sceneLength: number) =>
    (metersPerSceneUnit === null ? sceneLength : sceneToUnit(sceneLength, metersPerSceneUnit, unit)).toFixed(2);

  const lines: string[] = [];
  if (calibration) {
    lines.push(`"Scaling Ratio:",${calibration.length},${quote(calibration.unit)}`, '');
  }
  lines.push(HEADER);

  for (const m of measurements) {
    if (!m.visible || !m.a || !m.b) continue;
    const value = metersPerSceneUnit === null ? '' : toUnit(distance(m.a, m.b));
    lines.push(
      [
        quote(m.name),
        value,
        unit,
        toUnit(axisDelta(m.a, m.b, 'x')),
        toUnit(axisDelta(m.a, m.b, 'y')),
        toUnit(axisDelta(m.a, m.b, 'z')),
        ...m.a,
        ...m.b,
      ].join(','),
    );
  }
  return `${lines.join('\n')}\n`;
}
