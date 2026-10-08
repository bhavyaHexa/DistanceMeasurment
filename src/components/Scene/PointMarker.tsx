import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import { Html } from '@react-three/drei';

export const PointMarker = observer(function PointMarker({
  position,
  color,
}: {
  position: THREE.Vector3;
  color: string;
}) {
  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color,
          border: '2px solid white',
          boxShadow: '0 0 4px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}
      />
    </Html>
  );
});
