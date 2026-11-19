import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import type { Measurement } from '@/types/measurement';
import type { Axis } from '@/types/geometry';
import { measuredSegment, midpoint } from '@/utils/geometry';
import { measureColor } from '@/utils/measureColors';
import { AxisGuides } from './AxisGuides';
import { DraggablePointMarker } from './DraggablePointMarker';
import { PointMarker } from './PointMarker';
import { SegmentLine } from './SegmentLine';
import { ValueLabel } from './ValueLabel';

const AXES: readonly Axis[] = ['x', 'y', 'z'];

/** One measurement in 3D: its line and label; draggable ends and axis guides when selected. */
export const MeasurementObject = observer(function MeasurementObject({ measurement: m }: { measurement: Measurement }) {
  const { measurements, viewer } = useStores();
  if (!m.visible || !m.a) return null;

  const color = measureColor(m.colorIndex);
  if (!m.b) return <PointMarker position={m.a} color={color} />;

  const isSelected = measurements.isSelected(m.id);
  const isDragging = viewer.isDraggingMeasurement(m.id);

  const mode = m.selectedAxis;
  const [from, to] = measuredSegment(m.a, m.b, mode);
  // The selected axis is already drawn as the solid line, so its dashed guide would only duplicate it.
  const guideAxes = AXES.filter((axis) => axis !== mode);

  return (
    <group>
      {mode !== 'euclidean' && isSelected && <SegmentLine a={m.a} b={m.b} color={color} dashed />}
      <SegmentLine a={from} b={to} color={color} highlighted={isSelected && !viewer.isDragging} />
      <ValueLabel position={midpoint(from, to)} color={color} text={measurements.formatValue(m)} emphasized={isSelected} />
      {isSelected ? (
        <>
          <DraggablePointMarker target={{ kind: 'measurement', id: m.id, end: 'a' }} position={m.a} color={color} />
          <DraggablePointMarker target={{ kind: 'measurement', id: m.id, end: 'b' }} position={m.b} color={color} />
          {/* B stays draggable where it was picked; the axis line's own end gets a plain marker. */}
          {mode !== 'euclidean' && <PointMarker position={to} color={color} />}
          {!isDragging && <AxisGuides a={m.a} b={m.b} axes={guideAxes} />}
        </>
      ) : (
        <>
          <PointMarker position={from} color={color} />
          <PointMarker position={to} color={color} />
        </>
      )}
    </group>
  );
});
