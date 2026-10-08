import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import './OverlayControls.css';

export const ViewControls = observer(function ViewControls() {
  const { ui } = useStores();

  return (
    <div className="view-controls">
      <div className="view-group">
        <button 
          className={`tool-btn ${ui.viewTool === 'rotate' ? 'active' : ''}`}
          onClick={() => ui.setViewTool('rotate')}
          title="Rotate (R)"
          aria-label="Rotate"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        <button 
          className={`tool-btn ${ui.viewTool === 'pan' ? 'active' : ''}`}
          onClick={() => ui.setViewTool('pan')}
          title="Pan (P)"
          aria-label="Pan"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5 9 2 12 5 15"></polyline>
            <polyline points="9 5 12 2 15 5"></polyline>
            <polyline points="19 9 22 12 19 15"></polyline>
            <polyline points="9 19 12 22 15 19"></polyline>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="12" y1="2" x2="12" y2="22"></line>
          </svg>
        </button>
      </div>
      <div className="view-group">
        <button 
          className="tool-btn"
          onClick={() => ui.requestFit()}
          title="Fit view (F)"
          aria-label="Fit view"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14v6h6"></path>
            <path d="M20 10V4h-6"></path>
            <path d="M14 20h6v-6"></path>
            <path d="M10 4H4v6"></path>
          </svg>
        </button>
      </div>
    </div>
  );
});
