import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { NewProjectModal } from './NewProjectModal';
import './StartScreen.css';

export const StartScreen = observer(function StartScreen() {
  const { ui } = useStores();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="start-screen">
      <div className="start-content">
        <div className="start-badge">iTwin Run History Ready</div>
        <h1 className="start-title">3D Distance Measurement</h1>
        <p className="start-subtitle">
          Calibrate 3D scale and place high-precision annotations directly on photogrammetry meshes.
        </p>

        <div className="start-actions">
          <button 
            className="start-btn primary"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div className="btn-text-group">
              <span className="btn-main">New Project</span>
              <span className="btn-sub">Name project & upload photogrammetry ZIP</span>
            </div>
          </button>

          <button 
            className="start-btn secondary"
            onClick={() => ui.goToHistory()}
          >
            <div className="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="btn-text-group">
              <span className="btn-main">Existing Projects</span>
              <span className="btn-sub">Browse and reopen saved runs from history</span>
            </div>
          </button>
        </div>

        <div className="start-info-card">
          <h4>Supported Files in ZIP:</h4>
          <div className="format-tags">
            <span className="format-tag valid">.obj model</span>
            <span className="format-tag valid">.mtl material</span>
            <span className="format-tag valid">.jpg texture</span>
            <span className="format-tag ignored">.mp4 video (auto-filtered)</span>
          </div>
        </div>
      </div>

      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
});
