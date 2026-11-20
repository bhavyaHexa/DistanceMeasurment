import { Html } from '@react-three/drei';
import type { Vec3 } from '@/types/geometry';
import { HTML_PASS_THROUGH } from './htmlPassThrough';

export function PointMarker({ position, color }: { position: Vec3; color: string }) {
  return (
    <Html position={position} center style={HTML_PASS_THROUGH} zIndexRange={[90, 0]}>
      <span className="block size-3 rounded-full border-2 border-white shadow" style={{ background: color }} />
    </Html>
  );
}
