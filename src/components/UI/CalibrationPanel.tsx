import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { useState, useEffect } from 'react';
import './Panels.css';

export const CalibrationPanel = observer(function CalibrationPanel() {
  const { ui, measurement } = useStores();
  
  const [localLength, setLocalLength] = useState(measurement.calLength?.toString() || '');

  useEffect(() => {
    if (measurement.calLength !== null) {
      setLocalLength(measurement.calLength.toString());
    }
  }, [measurement.calLength]);

  const lengthVal = parseFloat(localLength);
  const canApply = measurement.calDraft.a && measurement.calDraft.b && !isNaN(lengthVal) && lengthVal > 0;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2 className="panel-title">Scale</h2>
      </div>

      <div className="panel-content">
        <div className="points-list">
          <div className="point-row">
            <span className="point-dot cal-dot">A</span>
            <span className="point-status">
              {measurement.calDraft.a ? 'Placed' : 'Click on the model'}
            </span>
            {measurement.calDraft.a && (
              <button className="btn-text sm muted" onClick={() => measurement.repickCal('a')}>Re-pick</button>
            )}
          </div>
          <div className="point-row">
            <span className="point-dot cal-dot">B</span>
            <span className="point-status">
              {measurement.calDraft.b ? 'Placed' : 'Click on the model'}
            </span>
            {measurement.calDraft.b && (
              <button className="btn-text sm muted" onClick={() => measurement.repickCal('b')}>Re-pick</button>
            )}
          </div>
        </div>

        <div className="length-input-group">
          <label>Actual distance</label>
          <div className="input-with-unit">
            <input 
              type="text" 
              inputMode="decimal"
              placeholder="0.0" 
              value={localLength} 
              onChange={(e) => setLocalLength(e.target.value)} 
            />
            <span className="unit-label">{ui.displayUnit}</span>
          </div>
        </div>
      </div>

      <div className="panel-footer">
        <button 
          className="btn-secondary" 
          style={{ flex: 1 }}
          onClick={() => {
            measurement.cancelCalibration();
            if (measurement.isCalibrated) {
              ui.goToMeasure();
            }
          }}
        >
          Cancel
        </button>
        <button 
          className="btn-primary" 
          style={{ flex: 1, background: 'var(--cal-line)' }}
          disabled={!canApply}
          onClick={() => {
            if (canApply) {
              measurement.applyCalibration(lengthVal, ui.displayUnit);
              ui.goToMeasure();
            }
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
});
