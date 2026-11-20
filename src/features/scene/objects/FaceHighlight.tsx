import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { DoubleSide } from 'three';
import type { Vec3 } from '@/types/geometry';

interface FaceHighlightProps {
  corners: [Vec3, Vec3, Vec3];
  color: string;
  /** Selected (stronger) rather than hovered. */
  strong: boolean;
}

/** A translucent triangle with an outline; depth testing is off so it never z-fights the surface. */
export function FaceHighlight({ corners, color, strong }: FaceHighlightProps) {
  const positions = useMemo(() => new Float32Array(corners.flat()), [corners]);
  return (
    <group>
      <mesh renderOrder={999} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={strong ? 0.5 : 0.35}
          side={DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <Line
        points={[corners[0], corners[1], corners[2], corners[0]]}
        color={color}
        lineWidth={strong ? 3.5 : 2.5}
        depthTest={false}
        renderOrder={1000}
      />
    </group>
  );
}
