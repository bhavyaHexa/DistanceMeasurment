import { Html } from '@react-three/drei';
import type { Vec3 } from '../../types/measurement';
import * as THREE from 'three';
import './Markers.css';

interface Props {
  position: Vec3 | THREE.Vector3;
  color?: string;
  isSnap?: boolean;
}

export function PointMarker({ position, color, isSnap }: Props) {
  const posArray = Array.isArray(position) ? position : [position.x, position.y, position.z];

  if (isSnap) {
    return (
      <Html position={posArray as [number, number, number]} center pointerEvents="none" zIndexRange={[100, 0]}>
        <div className="snap-ring" style={{ borderColor: color || 'var(--primary-strong)' }} />
      </Html>
    );
  }

  return (
    <Html position={posArray as [number, number, number]} center pointerEvents="none" zIndexRange={[90, 0]}>
      <div className="point-marker" style={{ '--marker-color': color || 'var(--primary)' } as React.CSSProperties} />
    </Html>
  );
}
