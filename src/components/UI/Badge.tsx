import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone = 'gray' | 'blue' | 'green' | 'red' | 'amber';

const TONES: Record<BadgeTone, { badge: string; dot: string }> = {
  gray: { badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  blue: { badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-600' },
  green: { badge: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
  red: { badge: 'bg-red-50 text-red-700', dot: 'bg-red-600' },
  amber: { badge: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
};

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[tone].badge)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', TONES[tone].dot)} />
      {children}
    </span>
  );
}
