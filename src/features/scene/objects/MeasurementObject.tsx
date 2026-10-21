import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import type { Measurement } from '@/types/measurement';
import { midpoint } from '@/utils/geometry';
import { measureColor } from '@/utils/measureColors';
import { AxisGuides } from './AxisGuides';
import { DraggablePointMarker } from './DraggablePointMarker';
import { PointMarker } from './PointMarker';
import { SegmentLine } from './SegmentLine';
import { ValueLabel } from './ValueLabel';

/** One measurement in 3D: its line and label; draggable ends and axis guides when selected. */
export const MeasurementObject = observer(function MeasurementObject({ measurement: m }: { measurement: Measurement }) {
  const { measurements, viewer } = useStores();
  if (!m.visible || !m.a) return null;

  const color = measureColor(m.colorIndex);
  if (!m.b) return <PointMarker position={m.a} color={color} />;

  const isSelected = measurements.isSelected(m.id);
  const isDragging = viewer.isDraggingMeasurement(m.id);

  return (
    <group>
      <SegmentLine a={m.a} b={m.b} color={color} highlighted={isSelected && !viewer.isDragging} />
      <ValueLabel position={midpoint(m.a, m.b)} color={color} text={measurements.formatValue(m)} emphasized={isSelected} />
      {isSelected ? (
        <>
          <DraggablePointMarker target={{ kind: 'measurement', id: m.id, end: 'a' }} position={m.a} color={color} />
          <DraggablePointMarker target={{ kind: 'measurement', id: m.id, end: 'b' }} position={m.b} color={color} />
          {!isDragging && <AxisGuides a={m.a} b={m.b} axes={['x', 'y', 'z']} />}
        </>
      ) : (
        <>
          <PointMarker position={m.a} color={color} />
          <PointMarker position={m.b} color={color} />
        </>
      )}
    </group>
  );
});
