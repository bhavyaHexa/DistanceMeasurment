import * as THREE from 'three';
import { Html } from '@react-three/drei';

/** Inline styles — CSS classes don't apply inside drei's Html portal */
const labelStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.82)',
  color: '#38bdf8',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 12,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  border: '1px solid rgba(56,189,248,0.45)',
  fontFamily: 'Inter, system-ui, sans-serif',
  letterSpacing: '0.02em',
};

export function MeasurementLabel({
  a,
  b,
  text,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  text: string;
}) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return (
    <Html position={mid} center distanceFactor={8} zIndexRange={[10, 0]}>
      <div style={labelStyle}>{text}</div>
    </Html>
  );
}
