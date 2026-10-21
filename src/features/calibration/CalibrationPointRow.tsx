import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import type { PointEnd } from '@/types/geometry';
import { cn } from '@/utils/cn';

const STATUS_TEXT = {
  placed: 'Placed',
  next: 'Click the model',
  waiting: 'Waiting',
} as const;

export const CalibrationPointRow = observer(function CalibrationPointRow({ end }: { end: PointEnd }) {
  const { calibration } = useStores();
  const status = calibration.pointStatus(end);
  const letter = end.toUpperCase();

  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
          status === 'next' ? 'bg-amber-500 text-white ring-4 ring-amber-100' : 'bg-amber-100 text-amber-900',
        )}
      >
        {letter}
      </span>
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium">Point {letter}</span>
        <span
          className={cn(
            'text-xs',
            status === 'placed' && 'text-green-700',
            status === 'next' && 'text-amber-800',
            status === 'waiting' && 'text-gray-500',
          )}
        >
          {STATUS_TEXT[status]}
        </span>
      </div>
      {status === 'placed' && (
        <button
          type="button"
          onClick={() => calibration.repick(end)}
          className="h-9 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-blue-700 hover:bg-blue-50"
        >
          Re-pick
        </button>
      )}
    </li>
  );
});
