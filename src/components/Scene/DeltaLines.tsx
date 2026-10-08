import { observer } from 'mobx-react-lite';
import { Html, Line } from '@react-three/drei';
import type { Measurement } from '../../types/measurement';
import './DeltaLabels.css';

export const DeltaLines = observer(function DeltaLines({ m }: { m: Measurement }) {

  // Delta dimension values are now shown in the MeasurementDetailBox instead of on the lines.

  const p1: [number, number, number] = [m.a[0], m.a[1], m.a[2]];
  const p2: [number, number, number] = [m.b[0], m.a[1], m.a[2]];
  const p3: [number, number, number] = [m.b[0], m.b[1], m.a[2]];
  const p4: [number, number, number] = [m.b[0], m.b[1], m.b[2]];

  const midX = [(p1[0] + p2[0]) / 2, p1[1], p1[2]];
  const midY = [p2[0], (p2[1] + p3[1]) / 2, p2[2]];
  const midZ = [p3[0], p3[1], (p3[2] + p4[2]) / 2];

  return (
    <group>
      <Line points={[p1, p2]} color="#cc0000" lineWidth={1} dashed depthTest={false} renderOrder={997} />
      <Html position={midX as [number, number, number]} center pointerEvents="none" zIndexRange={[70, 0]}>
        <div className="delta-label x">ΔX</div>
      </Html>

      <Line points={[p2, p3]} color="#d9a400" lineWidth={1} dashed depthTest={false} renderOrder={997} />
      <Html position={midY as [number, number, number]} center pointerEvents="none" zIndexRange={[70, 0]}>
        <div className="delta-label y">ΔY</div>
      </Html>

      <Line points={[p3, p4]} color="#0000cc" lineWidth={1} dashed depthTest={false} renderOrder={997} />
      <Html position={midZ as [number, number, number]} center pointerEvents="none" zIndexRange={[70, 0]}>
        <div className="delta-label z">ΔZ</div>
      </Html>
    </group>
  );
});
