import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  onValueChange: (value: string) => void;
  error?: string | null;
  /** Text shown inside the field's right edge, e.g. a unit. */
  suffix?: ReactNode;
}

export function TextField({ label, onValueChange, error, suffix, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div
        className={cn(
          'flex h-11 items-center overflow-hidden rounded-lg border bg-white shadow-xs transition-shadow',
          'focus-within:ring-4',
          error
            ? 'border-red-400 focus-within:ring-red-100'
            : 'border-gray-300 focus-within:border-blue-600 focus-within:ring-blue-100',
        )}
      >
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onValueChange(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
          {...props}
        />
        {suffix && (
          <span className="flex h-full items-center border-l border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-600">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
