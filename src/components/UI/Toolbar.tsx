import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { StepTabs } from './StepTabs';
import { NewProjectModal } from './NewProjectModal';
import type { Unit } from '../../types/measurement';
import './Toolbar.css';

const UNITS: Unit[] = ['mm', 'cm', 'm', 'in', 'ft'];

export const Toolbar = observer(function Toolbar() {
  const { ui, model, run } = useStores();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.zip')) {
        if (!run.currentRunId) {
          const defaultName = file.name.replace(/\.zip$/i, '');
          await run.createNewProject(defaultName);
        }
        await run.uploadAndConvertZip(file);
      } else {
        ui.requestReplace(file);
      }
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleSave = async () => {
    try {
      await run.saveProject();
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="btn-text header-nav-btn"
          title="Home / Switch Project"
          onClick={() => ui.goToStart()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </button>

        <button
          className="btn-text header-nav-btn"
          title="Browse Saved Runs"
          onClick={() => ui.goToHistory()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>History</span>
        </button>

        <div className="header-divider" />

        {run.projectName ? (
          <div className="file-chip">
            <span className="project-badge">Project:</span>
            <span className="file-name" title={run.projectName}>
              {run.projectName}
            </span>
            <button
              className="btn-text muted"
              style={{ height: 'auto', padding: '0 4px', fontSize: '0.8rem' }}
              onClick={() => document.getElementById('replace-file-input')?.click()}
            >
              Upload ZIP
            </button>
          </div>
        ) : model.file ? (
          <div className="file-chip">
            <span className="file-name" title={model.file.name}>
              {model.file.name}
            </span>
            <button
              className="btn-text muted"
              style={{ height: 'auto', padding: '0 4px' }}
              onClick={() => document.getElementById('replace-file-input')?.click()}
            >
              Replace
            </button>
          </div>
        ) : (
          <button
            className="btn-new-project-header"
            onClick={() => setIsNewProjectModalOpen(true)}
          >
            + New Project
          </button>
        )}

        <input
          id="replace-file-input"
          type="file"
          accept=".zip,.glb,.gltf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <StepTabs />

      <div className="header-right">
        {/* Save to Cloud Button */}
        {run.currentRunId && model.isLoaded && (
          <button
            className={`btn-save-project ${run.saveMessage ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={run.isSaving}
          >
            {run.isSaving ? (
              'Saving…'
            ) : run.saveMessage ? (
              'Saved ✓'
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Save</span>
              </>
            )}
          </button>
        )}

        {ui.step !== 'load' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>Units</span>
            <select
              className="units-select"
              value={ui.displayUnit}
              onChange={(e) => ui.setUnit(e.target.value as Unit)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </header>
  );
});
