import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { Vec3 } from '../../types/measurement';

export function MeasurementLine({
  a,
  b,
  color,
  dashed = false,
  isHover = false
}: {
  a: Vec3 | THREE.Vector3;
  b: Vec3 | THREE.Vector3;
  color: string;
  dashed?: boolean;
  isHover?: boolean;
}) {
  const pA = Array.isArray(a) ? a : [a.x, a.y, a.z];
  const pB = Array.isArray(b) ? b : [b.x, b.y, b.z];
  
  return (
    <group>
      <Line
        points={[pA as [number, number, number], pB as [number, number, number]]}
        color={color}
        lineWidth={dashed ? 2 : 4}
        dashed={dashed}
        dashSize={0.2}
        gapSize={0.1}
        depthTest={false}
        renderOrder={998}
      />
      {isHover && (
        <Line
          points={[pA as [number, number, number], pB as [number, number, number]]}
          color="#ffffff"
          lineWidth={2}
          depthTest={false}
          renderOrder={999}
        />
      )}
    </group>
  );
}
