import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import './NewProjectModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal = observer(function NewProjectModal({ isOpen, onClose }: Props) {
  const { run } = useStores();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = projectName.trim();
    if (!trimmed) {
      setErr('Please enter a project name');
      return;
    }

    try {
      setLoading(true);
      setErr(null);
      await run.createNewProject(trimmed);
      setLoading(false);
      setProjectName('');
      onClose();
    } catch (e: any) {
      setLoading(false);
      setErr(e.message || 'Failed to create project');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Project</h3>
          <button className="btn-close" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-desc">
              Enter a name for your 3D measurement project. You will then upload your photogrammetry ZIP archive.
            </p>
            <div className="form-group">
              <label htmlFor="project-name-input">Project Name</label>
              <input
                id="project-name-input"
                type="text"
                autoFocus
                placeholder="e.g. Bridge Pier A, Building Scan 01"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (err) setErr(null);
                }}
                disabled={loading}
              />
            </div>

            {err && <div className="modal-error">{err}</div>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !projectName.trim()}>
              {loading ? 'Creating...' : 'Create & Proceed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
