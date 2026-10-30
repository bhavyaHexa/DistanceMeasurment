import { Upload } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { useFileDrop } from '@/hooks/useFileDrop';
import { cn } from '@/utils/cn';

interface DropzoneProps {
  accept: string;
  onFile: (file: File) => void;
  hint: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** A click-or-drop target for a single file. */
export function Dropzone({ accept, onFile, hint, disabled = false, className }: DropzoneProps) {
  const inputId = useId();
  const { isDragActive, dropProps } = useFileDrop(onFile, disabled);

  return (
    <label
      htmlFor={inputId}
      {...dropProps}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed px-4 py-7 text-center transition-colors',
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white">
        <Upload aria-hidden className="size-[18px] text-gray-600" />
      </span>
      <span className="text-sm text-gray-700">
        <span className="font-medium text-blue-700">Choose a file</span> or drag it here
      </span>
      <span className="text-xs text-gray-600">{hint}</span>
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
    </label>
  );
}
