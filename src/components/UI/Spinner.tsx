import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <LoaderCircle
      className={cn('size-5 animate-spin', className)}
      aria-hidden={!label}
      aria-label={label}
      role={label ? 'status' : undefined}
    />
  );
}
