import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { PointMarker } from './PointMarker';
import { MeasurementLine } from './MeasurementLine';
import { MeasurementLabel } from './MeasurementLabel';
import { MeasurementDetailBox } from './MeasurementDetailBox';
import { DeltaLines } from './DeltaLines';
import { formatDistance } from '../../utils/units';

const CALIBRATION_COLOR = '#facc15';
const MEASUREMENT_COLOR = '#22d3ee';
const PENDING_COLOR = '#f87171';

export const MeasurementOverlay = observer(function MeasurementOverlay() {
  const { measurement } = useStores();

  return (
    <group>
      {measurement.measurements.map((m) => {
        const color = m.kind === 'calibration' ? CALIBRATION_COLOR : MEASUREMENT_COLOR;
        const real = measurement.realDistanceOf(m);
        const text =
          real != null
            ? formatDistance(real, measurement.unit)
            : `${m.rawDistance.toFixed(3)} (uncalibrated)`;

        return (
          <group key={m.id}>
            <PointMarker position={m.pointA} color={color} />
            <PointMarker position={m.pointB} color={color} />
            <MeasurementLine a={m.pointA} b={m.pointB} color={color} />
            <MeasurementLabel a={m.pointA} b={m.pointB} text={text} />
            <MeasurementDetailBox
              a={m.pointA}
              b={m.pointB}
              color={color}
              scaleFactor={measurement.scaleFactor}
              unit={measurement.unit}
            />
            {/* Delta lines (right-angle triangle) only for user measurements, not calibration */}
            {m.kind === 'measurement' && (
              <DeltaLines
                a={m.pointA}
                b={m.pointB}
                scaleFactor={measurement.scaleFactor}
                unit={measurement.unit}
              />
            )}
          </group>
        );
      })}

      {measurement.pendingPoints.map((p, i) => (
        <PointMarker key={i} position={p} color={PENDING_COLOR} />
      ))}
    </group>
  );
});
