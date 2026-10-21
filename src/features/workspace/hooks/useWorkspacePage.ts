import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useStores } from '@/hooks/useStores';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

/** Opens the project named in the URL and wires up workspace-wide behaviour. */
export function useWorkspacePage() {
  const { runId } = useParams<{ runId: string }>();
  const { project } = useStores();

  useEffect(() => {
    if (runId) void project.open(runId);
  }, [runId, project]);

  useKeyboardShortcuts();
  useUnsavedChangesGuard(project.hasUnsavedChanges);
}
