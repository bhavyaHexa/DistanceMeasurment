import { Html, Line } from '@react-three/drei';
import type { Axis, Vec3 } from '@/types/geometry';
import { axisLegs, midpoint } from '@/utils/geometry';
import { AXIS_COLORS } from '@/utils/measureColors';

/** Dashed, labelled guides showing the per-axis components of segment a→b. */
export function AxisGuides({
  a,
  b,
  axes,
  emphasized = false,
}: {
  a: Vec3;
  b: Vec3;
  axes: readonly Axis[];
  /** Draws solid, thick legs with larger labels, for the guide that defines the scale. */
  emphasized?: boolean;
}) {
  const path = axisLegs(a, b);

  return (
    <group>
      {axes.map((axis) => {
        const [from, to] = path[axis];
        return (
          <group key={axis}>
            <Line
              points={[from, to]}
              color={AXIS_COLORS[axis]}
              lineWidth={emphasized ? 5 : 2}
              dashed={!emphasized}
              dashSize={0.2}
              gapSize={0.1}
              depthTest={false}
              renderOrder={emphasized ? 999 : 997}
            />
            <Html position={midpoint(from, to)} center pointerEvents="none" zIndexRange={[70, 0]}>
              <span
                className={
                  emphasized
                    ? 'rounded bg-white px-2 py-1 text-xs font-bold shadow-md'
                    : 'rounded bg-white px-1.5 py-0.5 text-[11px] font-semibold shadow-sm'
                }
                style={{ color: AXIS_COLORS[axis] }}
              >
                Δ{axis.toUpperCase()}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
