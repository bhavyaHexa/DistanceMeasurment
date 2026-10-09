import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { useState } from 'react';
import { MEASURE_COLORS } from '../../utils/measureColors';
import './Panels.css';
import './MeasurementList.css';

export const MeasurementList = observer(function MeasurementList() {
  const { ui, measurement } = useStores();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editingPending, setEditingPending] = useState(false);

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    if (editingId) {
      if (editName.trim()) measurement.rename(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const exportCsv = () => {
    const csv = measurement.exportCsv(ui.displayUnit);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurements.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div className="scale-banner">
          <span className="scale-text">
            Scale set from {measurement.calLength} {measurement.calUnit}
          </span>
          <button className="btn-text sm muted" onClick={() => ui.goToCalibrate()}>Change</button>
        </div>
        
        <div className="list-title-row">
          <h2 className="panel-title">Measurements</h2>
        </div>
      </div>

      <div className="panel-content" style={{ padding: 0 }} onClick={() => measurement.select(null)}>
        <ul className="meas-list">
            {measurement.measurements.map(m => {
              const isSelected = measurement.selectedId === m.id;
              const colorObj = MEASURE_COLORS[m.colorIndex % MEASURE_COLORS.length];
              
              return (
                <li 
                  key={m.id} 
                  className={`meas-row-container ${isSelected ? 'selected' : ''} ${!m.visible ? 'hidden' : ''}`}
                  onClick={() => measurement.select(isSelected ? null : m.id)}
                >
                  <div className="meas-row-main">
                    <div 
                      className="meas-dot" 
                      style={{ background: colorObj.line, opacity: m.visible ? 1 : 0.4 }}
                      onClick={(e) => { e.stopPropagation(); measurement.toggleVisible(m.id); }}
                    />
                    
                    <div className="meas-name-col">
                      {editingId === m.id ? (
                        <input 
                          autoFocus
                          className="meas-edit-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                      ) : (
                        <div className="meas-name" onDoubleClick={() => startEdit(m.id, m.name)}>
                          {m.name}
                        </div>
                      )}
                    </div>

                    <div className="meas-value">
                      {(!m.a || !m.b) ? (
                        <button 
                          className={`btn-outline-sm measure-btn ${measurement.activeMeasureId === m.id ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (measurement.activeMeasureId === m.id) {
                              measurement.cancelMeasuring();
                            } else {
                              ui.goToMeasure();
                              measurement.startMeasuringRow(m.id);
                            }
                          }}
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                        >
                          {measurement.activeMeasureId === m.id ? 'Placing...' : 'Measure'}
                        </button>
                      ) : (
                        measurement.displayValue(m, ui.displayUnit)
                      )}
                    </div>
                    

                    <button 
                      className="btn-icon delete-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        measurement.remove(m.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {isSelected && (
                    <div className="meas-axis-selector">
                      <div className="axis-label">Use distance:</div>
                      <div className="axis-options-row">
                        <div 
                          className={`axis-option x ${m.selectedAxis === 'x' ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); measurement.setMeasurementAxis(m.id, 'x'); }}
                        >
                          <span className="axis-opt-title">ΔX</span> {measurement.displayDeltaValue(m, 'x', ui.displayUnit)}
                        </div>
                        <div 
                          className={`axis-option y ${m.selectedAxis === 'y' ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); measurement.setMeasurementAxis(m.id, 'y'); }}
                        >
                          <span className="axis-opt-title">ΔY</span> {measurement.displayDeltaValue(m, 'y', ui.displayUnit)}
                        </div>
                        <div 
                          className={`axis-option z ${m.selectedAxis === 'z' ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); measurement.setMeasurementAxis(m.id, 'z'); }}
                        >
                          <span className="axis-opt-title">ΔZ</span> {measurement.displayDeltaValue(m, 'z', ui.displayUnit)}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
            
          </ul>
        
        <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn-outline-sm" 
            style={{ padding: '4px 16px', fontSize: '12px' }}
            onClick={(e) => {
              e.stopPropagation();
              measurement.addEmptyMeasurement();
            }}
          >
            + Add
          </button>
        </div>
      </div>

      {measurement.measurements.length > 0 && (
        <div className="panel-footer">
          <button className="btn-text muted" onClick={() => {
            ui.askConfirm({
              title: `Delete all ${measurement.measurements.length} measurements?`,
              confirmLabel: 'Delete',
              onConfirm: () => measurement.clearAll()
            });
          }}>
            Clear all
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn-secondary" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
});
