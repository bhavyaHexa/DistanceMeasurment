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
          <button 
            className="btn-outline-sm" 
            onClick={() => {
              ui.goToMeasure();
              measurement.startAdding();
              measurement.select(null);
              setEditingPending(true);
            }}
          >
            + Add
          </button>
        </div>
      </div>

      <div className="panel-content" style={{ padding: 0 }}>
        {measurement.measurements.length === 0 && !measurement.isAdding ? (
          <div className="empty-list-state">
            Click on the model to add your first measurement.
          </div>
        ) : (
          <ul className="meas-list">
            {measurement.measurements.map(m => {
              const isSelected = measurement.selectedId === m.id;
              const colorObj = MEASURE_COLORS[m.colorIndex % MEASURE_COLORS.length];
              
              return (
                <li 
                  key={m.id} 
                  className={`meas-row ${isSelected ? 'selected' : ''} ${!m.visible ? 'hidden' : ''}`}
                  onClick={() => measurement.select(m.id)}
                >
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

                  <div className="meas-value">{measurement.displayValue(m, ui.displayUnit)}</div>
                  
                  <button 
                    className="btn-icon delete-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      measurement.remove(m.id);
                    }}
                  >
                    ×
                  </button>
                </li>
              );
            })}
            
            {measurement.isAdding && (
              <li className="meas-row selected">
                <div 
                  className="meas-dot" 
                  style={{ background: MEASURE_COLORS[measurement.nextColorIndex % MEASURE_COLORS.length].line }}
                />
                
                <div className="meas-name-col">
                  {editingPending ? (
                    <input 
                      autoFocus
                      className="meas-edit-input"
                      value={measurement.pendingName}
                      onChange={(e) => measurement.setPendingName(e.target.value)}
                      onBlur={() => setEditingPending(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingPending(false);
                      }}
                    />
                  ) : (
                    <div className="meas-name" onDoubleClick={() => setEditingPending(true)}>
                      {measurement.pendingName}
                    </div>
                  )}
                </div>

                <div className="meas-value" style={{ opacity: 0.5 }}>—</div>
                
                <button 
                  className="btn-icon delete-btn" 
                  onClick={() => measurement.cancelPending()}
                >
                  ×
                </button>
              </li>
            )}
          </ul>
        )}
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
