import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import type { MeasureMode, Measurement } from '@/types/measurement';
import { cn } from '@/utils/cn';

const OPTIONS: readonly { mode: MeasureMode; label: string; labelClass: string }[] = [
  { mode: 'euclidean', label: 'Direct', labelClass: 'text-gray-600' },
  { mode: 'x', label: 'ΔX', labelClass: 'text-red-700' },
  { mode: 'y', label: 'ΔY', labelClass: 'text-green-700' },
  { mode: 'z', label: 'ΔZ', labelClass: 'text-blue-700' },
];

/** Picks which length a measurement reports: straight-line or one axis component. */
export const AxisSwitch = observer(function AxisSwitch({ measurement: m }: { measurement: Measurement }) {
  const { measurements } = useStores();

  return (
    <div
      role="radiogroup"
      aria-label="Length to report"
      className="grid grid-cols-4 gap-1 rounded-lg border border-gray-200 bg-white p-[3px]"
    >
      {OPTIONS.map(({ mode, label, labelClass }) => {
        const checked = m.selectedAxis === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => measurements.setMode(m.id, mode)}
            className={cn(
              'flex h-11 cursor-pointer flex-col items-center justify-center rounded-md',
              checked ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50',
            )}
          >
            <span className={cn('text-[11px] font-semibold', checked ? 'text-white/85' : labelClass)}>{label}</span>
            <span className="text-xs tabular-nums">{measurements.formatValue(m, mode)}</span>
          </button>
        );
      })}
    </div>
  );
});
