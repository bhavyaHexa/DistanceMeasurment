import { cn } from '@/utils/cn';

interface ProgressBarProps {
  /** 0–100, or null for an indeterminate bar. */
  value: number | null;
  label: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value ?? undefined}
      className={cn('h-1.5 overflow-hidden rounded-full bg-gray-200', className)}
    >
      <div
        className={cn('h-full rounded-full bg-blue-600 transition-[width] duration-300', value === null && 'w-1/3 animate-pulse')}
        style={value === null ? undefined : { width: `${value}%` }}
      />
    </div>
  );
}
