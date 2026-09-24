import { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { useStores } from '../../stores/StoreContext';
import type { LengthUnit } from '../../types/measurement';

const UNITS: LengthUnit[] = ['mm', 'cm', 'm', 'in', 'ft'];

export const Toolbar = observer(function Toolbar() {
  const { measurement, model } = useStores();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) model.setFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      {/* Hidden file input for load/replace model */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Load / Replace model button */}
      <button className="btn" onClick={() => fileInputRef.current?.click()}>
        {model.isLoaded ? `📂 ${model.fileName}` : '📂 Load Model'}
      </button>

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
