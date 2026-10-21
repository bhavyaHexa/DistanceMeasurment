import { observer } from 'mobx-react-lite';
import { Maximize, Move, Rotate3d } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useStores } from '@/hooks/useStores';
import type { HintTone } from '@/types/workspace';
import { cn } from '@/utils/cn';

const HINT_DOT: Record<HintTone, string> = {
  neutral: 'bg-gray-400',
  active: 'bg-blue-400',
  calibration: 'bg-amber-400',
  success: 'bg-green-400',
};

/** Floating controls over the 3D view: camera tools, snapping and the current hint. */
export const ViewportControls = observer(function ViewportControls() {
  const { viewer, workspace } = useStores();
  const hint = workspace.hint;

  return (
    <>
      <div
        role="toolbar"
        aria-label="View"
        className="absolute top-4 left-4 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <IconButton
          icon={Rotate3d}
          label="Rotate (R)"
          size="lg"
          className="rounded-none"
          active={viewer.viewTool === 'rotate'}
          aria-pressed={viewer.viewTool === 'rotate'}
          onClick={() => viewer.setViewTool('rotate')}
        />
        <IconButton
          icon={Move}
          label="Pan (P)"
          size="lg"
          className="rounded-none border-t border-gray-100"
          active={viewer.viewTool === 'pan'}
          aria-pressed={viewer.viewTool === 'pan'}
          onClick={() => viewer.setViewTool('pan')}
        />
        <IconButton
          icon={Maximize}
          label="Fit to view (F)"
          size="lg"
          className="rounded-none border-t border-gray-100"
          onClick={viewer.requestFit}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-col-reverse items-center gap-2 sm:inset-x-4 sm:bottom-4 sm:flex-row sm:items-end">
        <label className="pointer-events-auto flex h-10 cursor-pointer items-center gap-2.5 self-start rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm sm:self-auto">
          <input
            type="checkbox"
            checked={viewer.snapToEdges}
            onChange={(event) => viewer.setSnapToEdges(event.target.checked)}
            className="size-4 accent-blue-600"
          />
          Snap to edges
        </label>

        {hint && (
          <div className="flex flex-1 justify-center sm:pr-36">
            <p
              role="status"
              className="flex items-center gap-2.5 rounded-full bg-gray-900 px-4 py-2.5 text-[13px] text-white shadow-lg"
            >
              <span aria-hidden className={cn('size-2 shrink-0 rounded-full', HINT_DOT[hint.tone])} />
              {hint.text}
            </p>
          </div>
        )}
      </div>
    </>
  );
});
