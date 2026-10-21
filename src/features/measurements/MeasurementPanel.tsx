import { observer } from 'mobx-react-lite';
import { Download, Plus, Ruler } from 'lucide-react';
import { PanelHeader } from '@/components/PanelHeader';
import { Button } from '@/components/ui/Button';
import { useStores } from '@/hooks/useStores';
import { useMeasurementActions } from './hooks/useMeasurementActions';
import { MeasurementRow } from './MeasurementRow';

export const MeasurementPanel = observer(function MeasurementPanel() {
  const { calibration, measurements, workspace } = useStores();
  const { confirmClearAll, exportCsv } = useMeasurementActions();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-4 mt-4 flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900">
        <Ruler aria-hidden className="size-4 shrink-0" />
        <span className="flex-1">Scale: A → B = {calibration.summary} (vertical)</span>
        <button
          type="button"
          onClick={() => workspace.openStep('calibrate')}
          className="cursor-pointer font-semibold underline-offset-2 hover:underline"
        >
          Change
        </button>
      </div>

      <PanelHeader
        title={
          <>
            Measurements
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {measurements.items.length}
            </span>
          </>
        }
        action={
          <Button size="sm" icon={Plus} onClick={measurements.startNew}>
            New
          </Button>
        }
      />

      {measurements.items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-10 text-center">
          <p className="text-sm font-medium">No measurements yet</p>
          <p className="text-sm text-gray-600">Click New, then click two points on the model.</p>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {measurements.items.map((m) => (
            <MeasurementRow key={m.id} measurement={m} />
          ))}
        </ul>
      )}

      {measurements.hasCompleted && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
          <Button variant="danger" size="sm" onClick={confirmClearAll}>
            Clear all
          </Button>
          <Button size="sm" icon={Download} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      )}
    </div>
  );
});
