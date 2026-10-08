import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useStores } from '../../stores/StoreContext';
import './ConfirmDialog.css';

export const ConfirmDialog = observer(function ConfirmDialog() {
  const { ui } = useStores();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ui.confirm) {
      cancelRef.current?.focus();
    }
  }, [ui.confirm]);

  if (!ui.confirm) return null;

  return (
    <div className="confirm-backdrop" onClick={() => ui.closeConfirm()}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{ui.confirm.title}</h3>
        <div className="confirm-actions">
          <button ref={cancelRef} className="btn-secondary" onClick={() => ui.closeConfirm()}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--danger)' }} 
            onClick={() => {
              ui.confirm?.onConfirm();
              ui.closeConfirm();
            }}
          >
            {ui.confirm.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
});
