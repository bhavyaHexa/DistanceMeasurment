import * as THREE from 'three';
import { Html } from '@react-three/drei';

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
      <div className="measurement-label">{text}</div>
    </Html>
  );
}
