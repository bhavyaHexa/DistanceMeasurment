import { useEffect } from 'react';
import { useBlocker } from 'react-router';
import { useStores } from './useStores';

/** Asks before leaving the workspace (in-app navigation or closing the tab) with unsaved changes. */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const { ui } = useStores();
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    ui.askConfirm({
      title: 'Leave without saving?',
      description: 'Your latest changes to this project have not been saved.',
      confirmLabel: 'Leave',
      tone: 'danger',
      onConfirm: () => blocker.proceed(),
      onCancel: () => blocker.reset(),
    });
  }, [blocker, ui]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);
}
