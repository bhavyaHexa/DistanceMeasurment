import type { Step } from '@/types/workspace';

export const STEPS: readonly { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'calibrate', label: 'Set scale' },
  { id: 'measure', label: 'Measure' },
];

export const UPLOAD_STAGES = ['Checking files', 'Uploading', 'Converting to 3D', 'Opening in viewer'] as const;
