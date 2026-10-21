import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/utils/cn';

interface SelectProps<T extends string> {
  label: string;
  /** Hide the label visually (it stays available to screen readers). */
  hideLabel?: boolean;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  className?: string;
}

export function Select<T extends string>({ label, hideLabel, value, options, onChange, className }: SelectProps<T>) {
  const id = useId();
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label htmlFor={id} className={cn('text-sm text-gray-600', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="h-9 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white pr-8 pl-3 text-sm text-gray-700 shadow-xs hover:bg-gray-50"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}
