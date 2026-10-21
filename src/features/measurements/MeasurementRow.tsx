import { observer } from 'mobx-react-lite';
import { Eye, EyeOff, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Menu } from '@/components/ui/Menu';
import { useStores } from '@/hooks/useStores';
import type { Measurement } from '@/types/measurement';
import { cn } from '@/utils/cn';
import { measureColor } from '@/utils/measureColors';
import { AxisSwitch } from './AxisSwitch';

export const MeasurementRow = observer(function MeasurementRow({ measurement: m }: { measurement: Measurement }) {
  const { measurements } = useStores();
  const color = measureColor(m.colorIndex);
  const isPlacing = measurements.placingId === m.id;
  const isSelected = measurements.isSelected(m.id);
  const isRenaming = measurements.renamingId === m.id;

  if (isPlacing) {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-dashed border-blue-400 py-1.5 pr-2 pl-3">
        <span aria-hidden className="size-2.5 shrink-0 rounded-[3px] border-2" style={{ borderColor: color }} />
        <span className="flex flex-1 flex-col">
          <span className="text-sm font-medium">{m.name}</span>
          <span className="text-xs text-blue-700">{m.a ? 'Click the end point…' : 'Click the start point…'}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={measurements.cancelPlacing}>
          Cancel
        </Button>
      </li>
    );
  }

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-1.5',
        isSelected ? 'border-blue-200 bg-blue-50/60' : 'border-transparent hover:bg-gray-50',
        !m.visible && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-1">
        {isRenaming ? (
          <input
            aria-label="Measurement name"
            defaultValue={m.name}
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
            onBlur={(event) => measurements.finishRename(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
              if (event.key === 'Escape') measurements.cancelRename();
            }}
            className="h-9 min-w-0 flex-1 rounded-md border border-blue-600 px-2 text-sm outline-none ring-4 ring-blue-100"
          />
        ) : (
          <button
            type="button"
            aria-expanded={isSelected}
            onClick={() => measurements.toggleSelected(m.id)}
            onDoubleClick={() => measurements.startRename(m.id)}
            className="flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md px-1.5 text-left"
          >
            <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />
            <span className="flex-1 truncate text-sm font-medium">{m.name}</span>
            <span className="text-sm font-semibold tabular-nums">{measurements.formatValue(m)}</span>
          </button>
        )}
        <IconButton
          icon={m.visible ? Eye : EyeOff}
          label={m.visible ? `Hide ${m.name}` : `Show ${m.name}`}
          size="sm"
          onClick={() => measurements.toggleVisible(m.id)}
        />
        <Menu
          triggerIcon={MoreVertical}
          triggerLabel={`More actions for ${m.name}`}
          items={[
            { label: 'Rename', icon: Pencil, onSelect: () => measurements.startRename(m.id) },
            { label: 'Delete', icon: Trash2, tone: 'danger', onSelect: () => measurements.remove(m.id) },
          ]}
        />
      </div>
      {isSelected && <AxisSwitch measurement={m} />}
    </li>
  );
});
