import type { BadgeTone } from '@/components/ui/Badge';
import type { RunStatus } from '@/types/api';

export const STATUS_TONE: Record<RunStatus, BadgeTone> = {
  created: 'gray',
  queued: 'blue',
  processing: 'blue',
  converted: 'blue',
  saved: 'green',
  failed: 'red',
};
