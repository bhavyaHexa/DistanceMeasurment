import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** Accessible name; also shown as a tooltip. */
  label: string;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'size-8', md: 'size-9', lg: 'size-11' } as const;

export function IconButton({
  icon: Icon,
  label,
  active = false,
  size = 'md',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        SIZES[size],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden className="size-[18px]" />
    </button>
  );
}
