import { useRef, useState, type DragEvent } from 'react';

const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files');

/** Drag-and-drop handlers for a drop target that accepts a single file. */
export function useFileDrop(onFile: (file: File) => void, disabled = false) {
  const [isDragActive, setDragActive] = useState(false);
  const depth = useRef(0);

  const dropProps = {
    onDragEnter(event: DragEvent) {
      if (disabled || !hasFiles(event)) return;
      event.preventDefault();
      depth.current++;
      setDragActive(true);
    },
    onDragOver(event: DragEvent) {
      if (disabled || !hasFiles(event)) return;
      event.preventDefault();
    },
    onDragLeave(event: DragEvent) {
      if (disabled || !hasFiles(event)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragActive(false);
    },
    onDrop(event: DragEvent) {
      if (disabled) return;
      event.preventDefault();
      depth.current = 0;
      setDragActive(false);
      const file = event.dataTransfer.files[0];
      if (file) onFile(file);
    },
  };

  return { isDragActive, dropProps };
}
