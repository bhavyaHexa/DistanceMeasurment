import { useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Check, Crosshair, Spline, Triangle, X, type LucideIcon } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useDismiss } from '@/hooks/useDismiss';
import { useStores } from '@/hooks/useStores';
import type { SceneEntity, SelectionFilter } from '@/types/selection';
import { cn } from '@/utils/cn';
import { distance } from '@/utils/geometry';
import { polylineLength, triangleArea, triangleNormal } from '@/utils/entityMetrics';
import { formatLength, roundForUnit, sceneToUnit } from '@/utils/units';

interface FilterOption {
  filter: SelectionFilter;
  label: string;
  key: string;
  icon: LucideIcon;
}

const FILTERS: readonly FilterOption[] = [
  { filter: 'point', label: 'Point', key: 'V', icon: Crosshair },
  { filter: 'edge', label: 'Edge', key: 'E', icon: Spline },
  { filter: 'face', label: 'Face', key: 'X', icon: Triangle },
];

/** The selection filter: what hovering and clicking on the model picks. */
export const SelectionToolbar = observer(function SelectionToolbar() {
  const { selection } = useStores();

  return (
    <div
      role="toolbar"
      aria-label="Selection filter"
      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      {FILTERS.map(({ filter, label, key, icon }, index) => (
        <IconButton
          key={filter}
          icon={icon}
          label={`Select ${label.toLowerCase()} (${key})`}
          size="lg"
          className={cn('rounded-none', index > 0 && 'border-t border-gray-100')}
          active={selection.filter === filter}
          aria-pressed={selection.filter === filter}
          onClick={() => selection.setFilter(filter)}
        />
      ))}
    </div>
  );
});

/** Measurements of what is selected. */
export const SelectionInfo = observer(function SelectionInfo() {
  const { selection, calibration, workspace } = useStores();
  const { selected } = selection;
  const scale = calibration.metersPerSceneUnit;
  const unit = workspace.displayUnit;
  if (selected.length === 0 || scale === null) return null;

  const length = (value: number) => formatLength(sceneToUnit(value, scale, unit), unit);
  const area = (value: number) => {
    const factor = sceneToUnit(1, scale, unit);
    return `${roundForUnit(value * factor * factor, unit)} ${unit}²`;
  };
  const coordinate = (value: number) => roundForUnit(sceneToUnit(value, scale, unit), unit);

  const describe = (entity: SceneEntity): { title: string; lines: [string, string][] } => {
    switch (entity.kind) {
      case 'point':
        return { title: 'Point', lines: [['X Y Z', entity.point.map(coordinate).join(', ')]] };
      case 'edge':
        return { title: 'Edge', lines: [['Length', length(polylineLength(entity.points))]] };
      case 'face':
        return {
          title: 'Face',
          lines: [
            ['Area', area(triangleArea(entity.corners))],
            ['Normal', triangleNormal(entity.corners).map((value) => value.toFixed(2)).join(', ')],
          ],
        };
    }
  };
  const rows = selected.map(describe);

  const points = selected.filter((entity) => entity.kind === 'point');
  const between =
    points.length === 2 && selected.length === 2 ? distance(points[0].point, points[1].point) : null;

  return (
    <div className="w-56 rounded-xl border border-gray-200 bg-white p-3 text-[13px] shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Selection ({selected.length})</span>
        <button
          type="button"
          onClick={selection.clearSelection}
          className="cursor-pointer text-xs font-medium text-blue-700 hover:underline"
        >
          Clear
        </button>
      </div>
      <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
        {rows.map((row, index) => (
          <li key={index} className="border-t border-gray-100 pt-2 first:border-t-0 first:pt-0">
            <p className="text-xs font-medium text-orange-600">{row.title}</p>
            {row.lines.map(([name, value]) => (
              <p key={name} className="flex justify-between gap-3 text-gray-600">
                <span>{name}</span>
                <span className="font-medium text-gray-900 tabular-nums">{value}</span>
              </p>
            ))}
          </li>
        ))}
      </ul>
      {between !== null && (
        <p className="mt-2 flex justify-between gap-3 border-t border-gray-200 pt-2 text-gray-600">
          <span>Distance</span>
          <span className="font-semibold text-gray-900 tabular-nums">{length(between)}</span>
        </p>
      )}
    </div>
  );
});

const MENU_WIDTH = 224;
const MENU_HEIGHT = 220;

/** Right-click menu: select the point, edge or face under the cursor. */
export const SelectionMenu = observer(function SelectionMenu() {
  const { selection } = useStores();
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => selection.closeMenu(), [selection]);
  const { menu } = selection;
  useDismiss(ref, menu !== null, close);
  if (!menu) return null;

  // Keep the menu on screen near the screen edges.
  const left = Math.max(8, Math.min(menu.x, window.innerWidth - MENU_WIDTH - 8));
  const top = Math.max(8, Math.min(menu.y, window.innerHeight - MENU_HEIGHT - 8));

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Selection"
      style={{ left, top, width: MENU_WIDTH }}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-30 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
    >
      <p className="px-3 pt-1 pb-1.5 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
        Select under cursor
      </p>
      {FILTERS.map(({ filter, label, key, icon: Icon }) => {
        const available = menu.options[filter] !== undefined;
        return (
          <button
            key={filter}
            type="button"
            role="menuitem"
            disabled={!available}
            onClick={() => selection.chooseFromMenu(filter)}
            className="flex h-10 w-full cursor-pointer items-center gap-2.5 px-3 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-default disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            <Icon aria-hidden className="size-4" />
            <span className="flex-1">{available ? `Select ${label.toLowerCase()}` : `No ${label.toLowerCase()} here`}</span>
            {selection.filter === filter ? (
              <Check aria-label="Active filter" className="size-4 text-blue-600" />
            ) : (
              <kbd className="text-xs text-gray-400">{key}</kbd>
            )}
          </button>
        );
      })}
      <div className="my-1 border-t border-gray-100" />
      <button
        type="button"
        role="menuitem"
        disabled={selection.selected.length === 0}
        onClick={() => {
          selection.clearSelection();
          selection.closeMenu();
        }}
        className="flex h-10 w-full cursor-pointer items-center gap-2.5 px-3 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-default disabled:text-gray-400 disabled:hover:bg-transparent"
      >
        <X aria-hidden className="size-4" />
        <span className="flex-1">Clear selection</span>
        <kbd className="text-xs text-gray-400">Esc</kbd>
      </button>
    </div>
  );
});
