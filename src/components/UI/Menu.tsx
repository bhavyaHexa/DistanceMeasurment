import { useCallback, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useDismiss } from '@/hooks/useDismiss';
import { cn } from '@/utils/cn';
import { IconButton } from './IconButton';

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  tone?: 'default' | 'danger';
}

interface MenuProps {
  triggerIcon: LucideIcon;
  triggerLabel: string;
  items: MenuItem[];
}

/** An icon button that opens a small list of actions. */
export function Menu({ triggerIcon, triggerLabel, items }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="relative">
      <IconButton
        icon={triggerIcon}
        label={triggerLabel}
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      />
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {items.map(({ label, icon: Icon, onSelect, tone }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.stopPropagation();
                close();
                onSelect();
              }}
              className={cn(
                'flex h-10 w-full cursor-pointer items-center gap-2.5 px-3 text-left text-sm hover:bg-gray-50',
                tone === 'danger' ? 'text-red-700' : 'text-gray-700',
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
