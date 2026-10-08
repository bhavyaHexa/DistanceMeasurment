import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { StepTabs } from './StepTabs';
import type { Unit } from '../../types/measurement';
import './Toolbar.css';

const UNITS: Unit[] = ['mm', 'cm', 'm', 'in', 'ft'];

export const Toolbar = observer(function Toolbar() {
  const { ui, model } = useStores();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      ui.requestReplace(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <header className="header">
      <div className="header-left">
        {!model.file ? (
          <span className="file-chip">No file open</span>
        ) : (
          <div className="file-chip">
            <span className="file-name" title={model.file.name}>{model.file.name}</span>
            <button className="btn-text muted" style={{ height: 'auto', padding: '0 4px' }} onClick={() => document.getElementById('replace-file-input')?.click()}>
              Replace
            </button>
          </div>
        )}
        <input 
          id="replace-file-input"
          type="file" 
          accept=".glb,.gltf" 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
      </div>

      <StepTabs />

      <div className="header-right">
        {ui.step !== 'load' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>Units</span>
            <select 
              className="units-select"
              value={ui.displayUnit}
              onChange={(e) => ui.setUnit(e.target.value as Unit)}
            >
              {UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
});
