import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';

/** The single app-wide confirmation dialog, driven by `UIStore.askConfirm`. */
export const ConfirmDialog = observer(function ConfirmDialog() {
  const { ui } = useStores();
  const request = ui.confirmRequest;

  return (
    <Dialog
      open={request !== null}
      title={request?.title ?? ''}
      description={request?.description}
      onClose={ui.cancelConfirm}
      footer={
        <>
          <Button variant="secondary" onClick={ui.cancelConfirm} autoFocus>
            Cancel
          </Button>
          <Button
            variant="primary"
            className={request?.tone === 'danger' ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' : undefined}
            onClick={ui.confirm}
          >
            {request?.confirmLabel}
          </Button>
        </>
      }
    />
  );
});
