import { observer } from 'mobx-react-lite';
import { AlertCircle, Check } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/utils/cn';

export const SaveStatus = observer(function SaveStatus({ className }: { className?: string }) {
  const { project } = useStores();
  const base = cn('items-center gap-1.5 text-sm', className);

  if (project.saveError) {
    return (
      <span role="alert" title={project.saveError} className={cn(base, 'text-red-700')}>
        <AlertCircle aria-hidden className="size-4" />
        Couldn't save
      </span>
    );
  }
  if (project.isSaving) return <span className={cn(base, 'text-gray-600')}>Saving…</span>;
  if (project.hasUnsavedChanges) {
    return (
      <span className={cn(base, 'text-gray-600')}>
        <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
        Unsaved changes
      </span>
    );
  }
  if (project.hasBeenSaved) {
    return (
      <span className={cn(base, 'text-gray-600')}>
        <Check aria-hidden className="size-4 text-green-700" />
        All changes saved
      </span>
    );
  }
  return null;
});
