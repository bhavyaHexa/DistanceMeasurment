import { useEffect } from 'react';
import { useBlocker } from 'react-router';
import { useStores } from './useStores';

/**
 * Asks before leaving the workspace (in-app navigation or closing the tab) with unsaved changes.
 * In-app navigation offers to save the changed dimensions first.
 */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean, save: () => Promise<void>) {
  const { ui, project } = useStores();
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    ui.askConfirm({
      title: 'Dimensions changed',
      description: 'Your dimension changes have not been saved. Save them before leaving?',
      confirmLabel: 'Save & leave',
      secondaryLabel: 'Leave without saving',
      onConfirm: () => {
        void save().then(() => {
          if (project.hasUnsavedChanges) blocker.reset();
          else blocker.proceed();
        });
      },
      onSecondary: () => blocker.proceed(),
      onCancel: () => blocker.reset(),
    });
  }, [blocker, ui, project, save]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);
}
