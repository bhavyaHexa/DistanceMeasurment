import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';

export const CalibrationPanel = observer(function CalibrationPanel() {
  const { measurement } = useStores();
  const [value, setValue] = useState('');

  if (measurement.pendingCalibrationRawDistance == null) return null;

  const submit = () => {
    const num = parseFloat(value);
    if (!Number.isFinite(num) || num <= 0) return;
    measurement.completeCalibration(num);
    setValue('');
  };

  return (
    <div className="calibration-panel">
      <p>
        Raw distance between the two points:{' '}
        <strong>{measurement.pendingCalibrationRawDistance.toFixed(4)}</strong> scene units
      </p>
      <label>
        Enter the known real-world distance ({measurement.unit})
        <input
          type="number"
          min={0}
          step="any"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </label>
      <div className="calibration-actions">
        <button className="btn" onClick={submit}>
          Confirm Calibration
        </button>
        <button className="btn btn-ghost" onClick={() => measurement.cancelPending()}>
          Cancel
        </button>
      </div>
    </div>
  );
});
