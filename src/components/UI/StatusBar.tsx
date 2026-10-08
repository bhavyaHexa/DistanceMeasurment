import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import './OverlayControls.css';

export const StatusBar = observer(function StatusBar() {
  const { ui, measurement } = useStores();

  let hintText = '';
  let dotColor = 'var(--text-disabled)';

  if (measurement.draggingId) {
    hintText = 'Drag to move the point. Release to drop it.';
    dotColor = 'var(--primary)';
  } else if (ui.step === 'calibrate') {
    if (!measurement.calDraft.a) {
      hintText = 'Click anywhere on the model to place Point A.';
      dotColor = 'var(--cal-line)';
    } else if (!measurement.calDraft.b) {
      hintText = 'Click again to place Point B.';
      dotColor = 'var(--cal-line)';
    } else {
      hintText = 'Enter actual distance in the panel and click Apply.';
      dotColor = 'var(--success)';
    }
  } else if (ui.step === 'measure') {
    if (measurement.pendingA) {
      hintText = 'Click to place the end point.';
      dotColor = 'var(--primary)';
    } else {
      hintText = 'Click on the model to start measuring.';
      dotColor = 'var(--text-muted)';
    }
  }

  return (
    <div className="status-bar" role="status">
      <div className="status-left">
        <div className="status-dot" style={{ background: dotColor }} />
        <span>{hintText}</span>
      </div>
      <div className="status-right">
        {ui.step === 'calibrate' ? (
          <span>Drag background to rotate</span>
        ) : (
          <label className="snap-checkbox">
            <input 
              type="checkbox" 
              checked={ui.snapToEdges} 
              onChange={(e) => ui.setSnap(e.target.checked)}
            />
            Snap to edges
          </label>
        )}
      </div>
    </div>
  );
});
