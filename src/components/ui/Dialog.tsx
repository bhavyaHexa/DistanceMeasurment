import { X } from 'lucide-react';
import { useId, type FormEvent, type ReactNode } from 'react';
import { useModalDialog } from '@/hooks/useModalDialog';
import { IconButton } from './IconButton';

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  /** When set, the body and footer form a <form> submitted by the footer's submit button. */
  onSubmit?: () => void;
  footer: ReactNode;
  children?: ReactNode;
}

export function Dialog({ open, title, description, onClose, onSubmit, footer, children }: DialogProps) {
  const ref = useModalDialog(open);
  const titleId = useId();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.();
  };

  const content = (
    <>
      {children && <div className="flex flex-col gap-5 px-6 pb-5">{children}</div>}
      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 px-6 py-4">{footer}</div>
    </>
  );

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-white p-0 text-gray-900 shadow-xl backdrop:bg-gray-950/45"
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <IconButton icon={X} label="Close" onClick={onClose} className="-mt-1 -mr-2" />
      </div>
      {onSubmit ? <form onSubmit={handleSubmit}>{content}</form> : content}
    </dialog>
  );
}
