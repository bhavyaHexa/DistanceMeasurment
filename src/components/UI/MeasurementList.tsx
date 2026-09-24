import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { formatDistance } from '../../utils/units';

export const MeasurementList = observer(function MeasurementList() {
  const { measurement } = useStores();

  const userMeasurements = measurement.measurements.filter((m) => m.kind !== 'calibration');

  return (
    <div className="measurement-list">
      <h3>Measurements</h3>

      {/* Calibration status — scale factor only, no remove button */}
      {measurement.scaleFactor != null ? (
        <div className="scale-status">
          <span className="scale-status__label">Scale</span>
          <span className="scale-status__value">
            1 unit = {formatDistance(measurement.scaleFactor, measurement.unit)}
          </span>
        </div>
      ) : (
        <p className="hint">Calibrate to see real-world distances.</p>
      )}

      {/* User measurements only */}
      {userMeasurements.length === 0 && measurement.scaleFactor != null && (
        <p className="hint" style={{ marginTop: 12 }}>No measurements yet.</p>
      )}
      <ul>
        {userMeasurements.map((m) => {
          const real = measurement.realDistanceOf(m);
          return (
            <li key={m.id}>
              <span className="kind">Measurement</span>
              <span className="value">
                {real != null ? formatDistance(real, measurement.unit) : `${m.rawDistance.toFixed(3)} u`}
              </span>
              <button className="btn-icon" onClick={() => measurement.removeMeasurement(m.id)}>
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
