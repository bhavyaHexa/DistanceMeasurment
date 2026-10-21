import { observer } from 'mobx-react-lite';
import { FileArchive, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Dropzone } from '@/components/ui/Dropzone';
import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { TextField } from '@/components/ui/TextField';
import { useStores } from '@/hooks/useStores';
import { formatBytes } from '@/utils/format';
import { SCAN_HINT } from '@/utils/zip';

export const NewProjectDialog = observer(function NewProjectDialog({ onSubmit }: { onSubmit: () => void }) {
  const { newProject: form } = useStores();

  return (
    <Dialog
      open={form.isOpen}
      title="New project"
      description="Name it and add your scan. The 3D model is built for you."
      onClose={form.close}
      onSubmit={onSubmit}
      footer={
        <>
          <Button onClick={form.close} disabled={form.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={form.isSubmitting} disabled={!form.canSubmit}>
            Create project
          </Button>
        </>
      }
    >
      <TextField
        label="Project name"
        placeholder="e.g. Bridge Pier A"
        value={form.name}
        onValueChange={form.setName}
        error={form.nameError}
        autoFocus
        required
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700">Scan ZIP</span>
        {form.scan || form.isPreparing ? (
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50">
              {form.isPreparing ? (
                <Spinner className="size-4 text-blue-700" />
              ) : (
                <FileArchive aria-hidden className="size-4 text-blue-700" />
              )}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{form.scan?.sourceName ?? 'Checking file…'}</span>
              {form.scan && (
                <span className="text-xs text-gray-600">
                  {formatBytes(form.scan.sourceSize)} · .obj, .mtl and .jpg found
                </span>
              )}
            </div>
            <IconButton icon={X} label="Remove file" size="sm" onClick={form.clearFile} />
          </div>
        ) : (
          <Dropzone accept=".zip" onFile={form.selectFile} hint={SCAN_HINT} />
        )}
        {form.fileError && <p className="text-sm text-red-700">{form.fileError}</p>}
      </div>

      {form.submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {form.submitError}
        </p>
      )}
    </Dialog>
  );
});
