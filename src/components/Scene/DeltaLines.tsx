import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { formatDistance } from '../../utils/units';
import type { LengthUnit } from '../../types/measurement';

const DELTA_COLOR = '#ff4d4d';
const DELTA_LINE_WIDTH = 1.5;

/** Small label pinned to the midpoint of a delta leg */
function DeltaLegLabel({
  a,
  b,
  text,
  offsetDir,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  text: string;
  offsetDir: THREE.Vector3;
}) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const offset = offsetDir.clone().multiplyScalar(len * 0.18 + 0.02);
  const pos: [number, number, number] = [
    mid.x + offset.x,
    mid.y + offset.y,
    mid.z + offset.z,
  ];

  return (
    <Html position={pos} center distanceFactor={8} zIndexRange={[8, 0]}>
      <div className="delta-label">{text}</div>
    </Html>
  );
}

interface Props {
  a: THREE.Vector3;
  b: THREE.Vector3;
  scaleFactor: number | null;
  unit: LengthUnit;
}

function fmt(rawLen: number, scaleFactor: number | null, unit: LengthUnit): string {
  if (scaleFactor != null) return formatDistance(rawLen * scaleFactor, unit);
  return `${rawLen.toFixed(3)} u`;
}

export function DeltaLines({ a, b, scaleFactor, unit }: Props) {
  // Corner point: same X/Z as A, but Y of B  →  forms the right angle
  const corner = new THREE.Vector3(a.x, b.y, a.z);

  const deltaY = Math.abs(a.y - b.y);
  const deltaH = Math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2); // horizontal (XZ)

  // Skip degenerate legs (nearly zero length)
  const showVertical = deltaY > 1e-5;
  const showHorizontal = deltaH > 1e-5;

  // Label offset directions (perpendicular to each leg in world space)
  // Vertical leg: offset sideways (X direction)
  const verticalOffsetDir = new THREE.Vector3(1, 0, 0);
  // Horizontal leg: offset upward
  const horizontalOffsetDir = new THREE.Vector3(0, 1, 0);

  return (
    <group>
      {/* Vertical leg: A → corner (height / ΔY) */}
      {showVertical && (
        <>
          <Line
            points={[a, corner]}
            color={DELTA_COLOR}
            lineWidth={DELTA_LINE_WIDTH}
            dashed
            dashSize={0.04}
            gapSize={0.025}
            depthTest={false}
            renderOrder={997}
          />
          <DeltaLegLabel
            a={a}
            b={corner}
            text={`↕ ${fmt(deltaY, scaleFactor, unit)}`}
            offsetDir={verticalOffsetDir}
          />
        </>
      )}

      {/* Horizontal leg: corner → B (XZ plane distance) */}
      {showHorizontal && (
        <>
          <Line
            points={[corner, b]}
            color={DELTA_COLOR}
            lineWidth={DELTA_LINE_WIDTH}
            dashed
            dashSize={0.04}
            gapSize={0.025}
            depthTest={false}
            renderOrder={997}
          />
          <DeltaLegLabel
            a={corner}
            b={b}
            text={`↔ ${fmt(deltaH, scaleFactor, unit)}`}
            offsetDir={horizontalOffsetDir}
          />
        </>
      )}

      {/* Right-angle indicator at the corner */}
      {showVertical && showHorizontal && (
        <RightAngleIndicator corner={corner} a={a} b={b} />
      )}
    </group>
  );
}

/** Small L-shaped square at the corner to indicate a 90° angle */
function RightAngleIndicator({
  corner,
  a,
  b,
}: {
  corner: THREE.Vector3;
  a: THREE.Vector3;
  b: THREE.Vector3;
}) {
  const size = corner.distanceTo(a) * 0.04 + corner.distanceTo(b) * 0.02;
  const s = Math.max(size, 0.005);

  // Unit vectors along each leg from the corner
  const upDir = a.clone().sub(corner).normalize().multiplyScalar(s);
  const hDir = b.clone().sub(corner).normalize().multiplyScalar(s);

  const p1 = corner.clone().add(upDir);
  const p2 = corner.clone().add(upDir).add(hDir);
  const p3 = corner.clone().add(hDir);

  return (
    <Line
      points={[p1, p2, p3]}
      color={DELTA_COLOR}
      lineWidth={1}
      depthTest={false}
      renderOrder={997}
      opacity={0.6}
      transparent
    />
  );
}
