import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { PointMarker } from './PointMarker';
import { MeasurementLine } from './MeasurementLine';
import { MeasurementLabel } from './MeasurementLabel';
import { MeasurementDetailBox } from './MeasurementDetailBox';
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
              <PointMarker position={m.pointA} color={MEASUREMENT_COLOR} />
              <PointMarker position={m.pointB} color={MEASUREMENT_COLOR} />
              <MeasurementLine a={m.pointA} b={m.pointB} color={MEASUREMENT_COLOR} />
              <MeasurementLabel a={m.pointA} b={m.pointB} text={text} />
              <MeasurementDetailBox
                a={m.pointA}
                b={m.pointB}
                color={MEASUREMENT_COLOR}
                scaleFactor={measurement.scaleFactor}
                unit={measurement.unit}
              />
              <DeltaLines
                a={m.pointA}
                b={m.pointB}
                scaleFactor={measurement.scaleFactor}
                unit={measurement.unit}
              />
            </group>
          );
        })}

      {measurement.pendingPoints.map((p, i) => (
        <PointMarker key={i} position={p} color={PENDING_COLOR} />
      ))}
    </group>
  );
});
