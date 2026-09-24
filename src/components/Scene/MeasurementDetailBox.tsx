import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { formatDistance } from '../../utils/units';
import type { LengthUnit } from '../../types/measurement';

interface Props {
  a: THREE.Vector3;
  b: THREE.Vector3;
  color: string;
  /** mm per scene-unit; null = uncalibrated */
  scaleFactor: number | null;
  unit: LengthUnit;
}

function scaleRaw(raw: number, scaleFactor: number | null): number | null {
  return scaleFactor != null ? raw * scaleFactor : null;
}

function fmtRaw(raw: number, scaleFactor: number | null, unit: LengthUnit): string {
  const real = scaleRaw(Math.abs(raw), scaleFactor);
  if (real != null) return formatDistance(real, unit);
  return `${Math.abs(raw).toFixed(3)} u`;
}

export function MeasurementDetailBox({ a, b, color, scaleFactor, unit }: Props) {
  const mid = a.clone().add(b).multiplyScalar(0.5);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  const total = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const totalReal = scaleRaw(total, scaleFactor);
  const totalText =
    totalReal != null ? formatDistance(totalReal, unit) : `${total.toFixed(3)} u`;

  // Compute a perpendicular offset so the box sits beside the line
  const dir = b.clone().sub(a).normalize();
  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const perp = new THREE.Vector3().crossVectors(dir, up).normalize();
  const offset = perp.multiplyScalar(total * 0.15 + 0.05);
  const boxPos: [number, number, number] = [
    mid.x + offset.x,
    mid.y + offset.y,
    mid.z + offset.z,
  ];

  const borderColor = color + '88';

  return (
    <Html position={boxPos} center distanceFactor={8} zIndexRange={[9, 0]}>
      <div
        className="detail-box"
        style={{ '--detail-accent': color, '--detail-border': borderColor } as React.CSSProperties}
      >
        <div className="detail-box__total">{totalText}</div>
        <div className="detail-box__divider" />
        <div className="detail-box__row">
          <span className="detail-box__axis x">ΔX</span>
          <span className="detail-box__val">{fmtRaw(dx, scaleFactor, unit)}</span>
        </div>
        <div className="detail-box__row">
          <span className="detail-box__axis y">ΔY</span>
          <span className="detail-box__val">{fmtRaw(dy, scaleFactor, unit)}</span>
        </div>
        <div className="detail-box__row">
          <span className="detail-box__axis z">ΔZ</span>
          <span className="detail-box__val">{fmtRaw(dz, scaleFactor, unit)}</span>
        </div>
      </div>
    </Html>
  );
}
