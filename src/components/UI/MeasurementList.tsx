import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { formatDistance } from '../../utils/units';

export const MeasurementList = observer(function MeasurementList() {
  const { measurement } = useStores();

  return (
    <div className="measurement-list">
      <h3>Measurements</h3>
      {measurement.scaleFactor == null && (
        <p className="hint">Calibrate to see real-world distances.</p>
      )}
      <ul>
        {measurement.measurements.map((m) => {
          const real = measurement.realDistanceOf(m);
          return (
            <li key={m.id} className={m.kind === 'calibration' ? 'is-calibration' : ''}>
              <span className="kind">{m.kind === 'calibration' ? 'Calibration' : 'Measurement'}</span>
              <span className="value">{formatDistance(real, measurement.unit)}</span>
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
