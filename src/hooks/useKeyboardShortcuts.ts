import { useEffect } from 'react';
import { useStores } from './useStores';

function isTyping(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  return !!element && (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || element.isContentEditable);
}

/**
 * Workspace shortcuts: Esc cancels placement, Ctrl/⌘+Z undoes, Delete removes the selected
 * measurement, R / P switch rotate / pan, F fits the model in view, V / E / X pick the point / edge / face
 * selection filter.
 */
export function useKeyboardShortcuts() {
  const { ui, history, measurements, viewer, workspace, selection } = useStores();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target) || ui.confirmRequest) return;
      const withModifier = event.ctrlKey || event.metaKey;

      if (withModifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        history.undo();
        return;
      }
      if (withModifier || event.altKey) return;

      switch (event.key) {
        case 'Escape':
          workspace.cancelInteraction();
          break;
        case 'Delete':
        case 'Backspace':
          if (measurements.selectedId) measurements.remove(measurements.selectedId);
          break;
        case 'r':
        case 'R':
          viewer.setViewTool('rotate');
          break;
        case 'p':
        case 'P':
          viewer.setViewTool('pan');
          break;
        case 'f':
        case 'F':
          viewer.requestFit();
          break;
        case 'v':
        case 'V':
          if (workspace.step === 'measure') selection.setFilter('point');
          break;
        case 'e':
        case 'E':
          if (workspace.step === 'measure') selection.setFilter('edge');
          break;
        case 'x':
        case 'X':
          if (workspace.step === 'measure') selection.setFilter('face');
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ui, history, measurements, viewer, workspace, selection]);
}
