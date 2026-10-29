import { observer } from 'mobx-react-lite';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { TextField } from '@/components/ui/TextField';
import { useStores } from '@/hooks/useStores';

export const NewProjectDialog = observer(function NewProjectDialog({ onSubmit }: { onSubmit: () => void }) {
  const { newProject: form } = useStores();

  return (
    <Dialog
      open={form.isOpen}
      title="New project"
      description="Name your project, then upload a video to create its 3D model."
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

      {form.submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {form.submitError}
        </p>
      )}
    </Dialog>
  );
});
