import { Html } from '@react-three/drei';
import type { Vec3 } from '@/types/geometry';

/** Ring showing where a click will place the next point. */
export function SnapIndicator({ position }: { position: Vec3 }) {
  return (
    <Html position={position} center pointerEvents="none" zIndexRange={[100, 0]}>
      <span className="block size-[18px] rounded-full border-2 border-blue-600 bg-blue-600/15" />
    </Html>
  );
}
