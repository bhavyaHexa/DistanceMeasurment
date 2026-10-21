import { useStores } from '@/hooks/useStores';
import { downloadTextFile, toFileStem } from '@/utils/download';

/** Panel actions that involve the confirmation dialog or a file download. */
export function useMeasurementActions() {
  const { measurements, project, ui } = useStores();

  const confirmClearAll = () =>
    ui.askConfirm({
      title: `Delete all ${measurements.items.length} measurements?`,
      description: 'You can undo this with Ctrl+Z.',
      confirmLabel: 'Delete all',
      tone: 'danger',
      onConfirm: measurements.clearAll,
    });

  const exportCsv = () =>
    downloadTextFile(`${toFileStem(project.name)}-measurements.csv`, measurements.csv, 'text/csv');

  return { confirmClearAll, exportCsv };
}
