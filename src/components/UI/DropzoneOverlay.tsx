import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import './DropzoneOverlay.css';

interface Props {
  variant?: 'empty' | 'drag';
}

export const DropzoneOverlay = observer(function DropzoneOverlay({ variant = 'empty' }: Props) {
  const { ui, model } = useStores();
  const counter = useRef(0);

  useEffect(() => {
    if (variant !== 'drag') return;
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types ? Array.from(e.dataTransfer.types).includes('Files') : false;

    const handleDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      counter.current++;
      ui.setDraggingFile(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      counter.current--;
      if (counter.current === 0) ui.setDraggingFile(false);
    };
    const handleDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      counter.current = 0;
      ui.setDraggingFile(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
        if (ui.step === 'load') {
          model.setFile(file);
        } else {
          ui.requestReplace(file);
        }
      } else if (file) {
        model.setError("Could not load model. Try checking the file format (.glb or .gltf) or reducing its size.");
      }
    };
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [variant, ui, model]);

  if (variant === 'drag') {
    if (!ui.isDraggingFile) return null;
    return (
      <div className="dropzone-drag">
        <div className="drag-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <h2>Release to open</h2>
        </div>
      </div>
    );
  }

  // empty variant
  return (
    <div className="dropzone-empty">
      <div className="empty-box" onClick={() => document.getElementById('replace-file-input')?.click()}>
        <div className="upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h2 className="empty-title">Open file…</h2>
        <p className="empty-legend">.glb or .gltf only</p>
      </div>

      {model.loadProgress !== null && (
        <div className="loading-bar">
          <div className="progress" style={{ width: `${model.loadProgress}%` }} />
        </div>
      )}
      
      {model.error && (
        <div className="error-text">{model.error}</div>
      )}
    </div>
  );
});
