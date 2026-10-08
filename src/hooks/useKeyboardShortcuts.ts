import { useEffect } from 'react';
import { useStores } from '../stores/StoreContext';

export function useKeyboardShortcuts() {
  const { ui, measurement } = useStores();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          if (ui.confirm) {
            ui.closeConfirm();
          } else {
            measurement.cancelPending();
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            measurement.undo();
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (measurement.selectedId) {
            measurement.remove(measurement.selectedId);
          }
          break;
        case 'r':
        case 'R':
          ui.setViewTool('rotate');
          break;
        case 'p':
        case 'P':
          ui.setViewTool('pan');
          break;
        case 'f':
        case 'F':
          ui.requestFit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ui, measurement]);
}
