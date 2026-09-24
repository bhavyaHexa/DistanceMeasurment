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

const AXIS_COLOR: Record<string, string> = {
  x: '#f87171', // red
  y: '#4ade80', // green
  z: '#60a5fa', // blue
};

export function MeasurementDetailBox({ a, b, color, scaleFactor, unit }: Props) {
  const mid = a.clone().add(b).multiplyScalar(0.5);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  const total = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const totalReal = scaleRaw(total, scaleFactor);
  const totalText =
    totalReal != null ? formatDistance(totalReal, unit) : `${total.toFixed(3)} u`;

  // Perpendicular offset so the box sits beside the line
  const dir = b.clone().sub(a).normalize();
  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const perp = new THREE.Vector3().crossVectors(dir, up).normalize();
  const offset = perp.multiplyScalar(total * 0.15 + 0.05);
  const boxPos: [number, number, number] = [
    mid.x + offset.x,
    mid.y + offset.y,
    mid.z + offset.z,
  ];

  // Inline styles — CSS classes don't apply inside drei's Html portal
  const boxStyle: React.CSSProperties = {
    background: 'rgba(10, 10, 15, 0.88)',
    border: `1px solid ${color}66`,
    borderRadius: 8,
    padding: '7px 11px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 110,
    boxShadow: `0 2px 12px rgba(0,0,0,0.5), 0 0 0 1px ${color}22`,
    fontFamily: 'Inter, system-ui, sans-serif',
    pointerEvents: 'none',
    userSelect: 'none',
  };

  const totalStyle: React.CSSProperties = {
    color,
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: '0.02em',
    textAlign: 'center',
    paddingBottom: 4,
  };

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: `${color}44`,
    margin: '0 -2px 2px',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  };

  const valStyle: React.CSSProperties = {
    color: '#e4e4e7',
    fontSize: 11,
    fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
    fontWeight: 500,
  };

  const rows: Array<{ axis: string; key: string; val: string }> = [
    { axis: 'ΔX', key: 'x', val: fmtRaw(dx, scaleFactor, unit) },
    { axis: 'ΔY', key: 'y', val: fmtRaw(dy, scaleFactor, unit) },
    { axis: 'ΔZ', key: 'z', val: fmtRaw(dz, scaleFactor, unit) },
  ];

  return (
    <Html position={boxPos} center distanceFactor={8} zIndexRange={[9, 0]}>
      <div style={boxStyle}>
        {/* Total distance */}
        <div style={totalStyle}>{totalText}</div>
        <div style={dividerStyle} />
        {/* Per-axis rows */}
        {rows.map(({ axis, key, val }) => (
          <div key={key} style={rowStyle}>
            <span style={{ color: AXIS_COLOR[key], fontWeight: 700, fontSize: 11 }}>
              {axis}
            </span>
            <span style={valStyle}>{val}</span>
          </div>
        ))}
      </div>
    </Html>
  );
}
