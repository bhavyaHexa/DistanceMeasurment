import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { useStores } from '../../stores/StoreContext';
import type { LengthUnit } from '../../types/measurement';

const UNITS: LengthUnit[] = ['mm', 'cm', 'm', 'in', 'ft'];

export const Toolbar = observer(function Toolbar() {
  const { measurement, model } = useStores();

  return (
    <div className="toolbar">
      <button
        className={clsx('btn', measurement.mode === 'placing-calibration' && 'btn-active')}
        disabled={!model.isLoaded}
        onClick={() => measurement.startCalibration()}
      >
        {measurement.scaleFactor != null ? 'Recalibrate' : 'Calibrate'}
      </button>

      <button
        className={clsx('btn', measurement.mode === 'placing-measurement' && 'btn-active')}
        disabled={!model.isLoaded || measurement.scaleFactor == null}
        title={measurement.scaleFactor == null ? 'Calibrate first' : undefined}
        onClick={() => measurement.startMeasurement()}
      >
        Measure
      </button>

      {measurement.mode !== 'idle' && (
        <button className="btn btn-ghost" onClick={() => measurement.cancelPending()}>
          Cancel ({measurement.pendingPoints.length}/2 points placed)
        </button>
      )}

      <select
        className="unit-select"
        value={measurement.unit}
        onChange={(e) => measurement.setUnit(e.target.value as LengthUnit)}
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      <button className="btn btn-danger" onClick={() => measurement.resetAll()}>
        Reset Measurements
      </button>
    </div>
  );
});
