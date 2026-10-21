import { Line } from '@react-three/drei';
import type { Vec3 } from '@/types/geometry';

interface SegmentLineProps {
  a: Vec3;
  b: Vec3;
  color: string;
  dashed?: boolean;
  /** Draws a thin white core to mark the selected measurement. */
  highlighted?: boolean;
}

/** A line drawn on top of the model (no depth test), so it stays visible from any angle. */
export function SegmentLine({ a, b, color, dashed = false, highlighted = false }: SegmentLineProps) {
  return (
    <group>
      <Line
        points={[a, b]}
        color={color}
        lineWidth={dashed ? 2.5 : 4}
        dashed={dashed}
        dashSize={0.2}
        gapSize={0.1}
        depthTest={false}
        renderOrder={998}
      />
      {highlighted && <Line points={[a, b]} color="#ffffff" lineWidth={1.5} depthTest={false} renderOrder={999} />}
    </group>
  );
}
