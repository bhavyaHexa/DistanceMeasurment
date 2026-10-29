import type { Step } from '@/types/workspace';

export const STEPS: readonly { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'calibrate', label: 'Set scale' },
  { id: 'measure', label: 'Measure' },
];

export const UPLOAD_STAGES = ['Upload video', 'Create 3D model', 'Load model'] as const;
