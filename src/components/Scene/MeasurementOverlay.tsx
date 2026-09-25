import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { DraggablePointMarker } from './DraggablePointMarker';
import { PointMarker } from './PointMarker';
import { MeasurementLine } from './MeasurementLine';
import { MeasurementLabel } from './MeasurementLabel';
import { DeltaLines } from './DeltaLines';
import { formatDistance } from '../../utils/units';

const MEASUREMENT_COLOR = '#22d3ee';
const PENDING_COLOR = '#f87171';

export const MeasurementOverlay = observer(function MeasurementOverlay() {
  const { measurement } = useStores();

  return (
    <group>
      {measurement.measurements
        .filter((m) => m.kind !== 'calibration')
        .map((m) => {
          const real = measurement.realDistanceOf(m);
          const text =
            real != null
              ? formatDistance(real, measurement.unit)
              : `${m.rawDistance.toFixed(3)} (uncalibrated)`;

          return (
            <group key={m.id}>
              {/* Draggable endpoints — grab & drag to reposition on the model */}
              <DraggablePointMarker
                measurementId={m.id}
                which="A"
                position={m.pointA}
                color={MEASUREMENT_COLOR}
              />
              <DraggablePointMarker
                measurementId={m.id}
                which="B"
                position={m.pointB}
                color={MEASUREMENT_COLOR}
              />
              <MeasurementLine a={m.pointA} b={m.pointB} color={MEASUREMENT_COLOR} />
              <MeasurementLabel a={m.pointA} b={m.pointB} text={text} />
              <DeltaLines
                a={m.pointA}
                b={m.pointB}
                scaleFactor={measurement.scaleFactor}
                unit={measurement.unit}
              />
            </group>
          );
        })}

      {/* Pending points (non-draggable — still being placed) */}
      {measurement.pendingPoints.map((p, i) => (
        <PointMarker key={i} position={p} color={PENDING_COLOR} />
      ))}
    </group>
  );
});
