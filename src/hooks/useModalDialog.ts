import { useEffect, useRef } from 'react';

/** Keeps a native <dialog> open as a modal while `open` is true (focus trap, Esc and backdrop for free). */
export function useModalDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return ref;
}
