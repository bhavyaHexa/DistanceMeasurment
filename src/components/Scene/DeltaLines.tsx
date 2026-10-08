import { observer } from 'mobx-react-lite';
import { Html, Line } from '@react-three/drei';
import type { Measurement } from '../../types/measurement';
import './DeltaLabels.css';

export const DeltaLines = observer(function DeltaLines({ m }: { m: Measurement }) {
  const p1: [number, number, number] = [m.a[0], m.a[1], m.a[2]];
  const pY: [number, number, number] = [m.a[0], m.b[1], m.a[2]];
  const pX: [number, number, number] = [m.b[0], m.b[1], m.a[2]];
  const pZ: [number, number, number] = [m.b[0], m.b[1], m.b[2]];

  const midY = [m.a[0], (m.a[1] + m.b[1]) / 2, m.a[2]];
  const midX = [(m.a[0] + m.b[0]) / 2, m.b[1], m.a[2]];
  const midZ = [m.b[0], m.b[1], (m.a[2] + m.b[2]) / 2];

  return (
    <group>
      {/* Delta Y (Yellow) */}
      <Line points={[p1, pY]} color="#d9a400" lineWidth={2} dashed dashSize={0.2} gapSize={0.1} depthTest={false} renderOrder={997} />
      <Html position={midY as [number, number, number]} center pointerEvents="none" zIndexRange={[70, 0]}>
        <div className="delta-label y">ΔY</div>
      </Html>

      {/* Delta X (Red) */}
      <Line points={[pY, pX]} color="#cc0000" lineWidth={2} dashed dashSize={0.2} gapSize={0.1} depthTest={false} renderOrder={997} />
      <Html position={midX as [number, number, number]} center pointerEvents="none" zIndexRange={[70, 0]}>
        <div className="delta-label x">ΔX</div>
      </Html>

      {/* Delta Z (Blue) */}
      <Line points={[pX, pZ]} color="#0000cc" lineWidth={2} dashed dashSize={0.2} gapSize={0.1} depthTest={false} renderOrder={997} />
      <Html position={midZ as [number, number, number]} center pointerEvents="none" zIndexRange={[70, 0]}>
        <div className="delta-label z">ΔZ</div>
      </Html>
    </group>
  );
});
