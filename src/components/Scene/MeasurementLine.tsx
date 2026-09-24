import * as THREE from 'three';
import { Line } from '@react-three/drei';

export function MeasurementLine({
  a,
  b,
  color,
  dashed = false,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  color: string;
  dashed?: boolean;
}) {
  return (
    <Line
      points={[a, b]}
      color={color}
      lineWidth={2}
      dashed={dashed}
      depthTest={false}
      renderOrder={998}
    />
  );
}
