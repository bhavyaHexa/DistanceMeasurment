import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import './DropzoneOverlay.css';

interface Props {
  variant?: 'empty' | 'drag';
}

export const DropzoneOverlay = observer(function DropzoneOverlay({ variant = 'empty' }: Props) {
  const { ui, model, run } = useStores();
  const counter = useRef(0);

  const handleProcessFile = async (file: File) => {
    // If it's a zip file, process through runStore (filters mp4, converts via API)
    if (file.name.endsWith('.zip')) {
      if (!run.currentRunId) {
        // Fallback: auto-create a project with zip's name if none active
        const projName = file.name.replace(/\.zip$/i, '');
        await run.createNewProject(projName);
      }
      try {
        await run.uploadAndConvertZip(file);
      } catch (err) {
        console.error('ZIP conversion error:', err);
      }
    } else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
      // Direct GLB load
      if (ui.step === 'load') {
        model.setFile(file);
      } else {
        ui.requestReplace(file);
      }
    } else {
      model.setError('Please upload a .zip archive (containing .obj, .mtl, .jpg) or a .glb file.');
    }
  };

  useEffect(() => {
    if (variant !== 'drag') return;
    const hasFiles = (e: DragEvent) =>
      e.dataTransfer?.types ? Array.from(e.dataTransfer.types).includes('Files') : false;

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
      if (file) {
        handleProcessFile(file);
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
  }, [variant, ui, model, run]);

  if (variant === 'drag') {
    if (!ui.isDraggingFile) return null;
    return (
      <div className="dropzone-drag">
        <div className="drag-content">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '16px' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <h2>Release to upload archive (.zip)</h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>.mp4 files are automatically excluded</p>
        </div>
      </div>
    );
  }

  // Empty load state
  const isConverting = run.isUploading || run.isProcessing;

  return (
    <div className="dropzone-empty">
      <div
        className={`empty-box ${isConverting ? 'uploading' : ''}`}
        onClick={() => {
          if (!isConverting) {
            document.getElementById('replace-file-input')?.click();
          }
        }}
      >
        <div className="upload-icon">
          {run.isProcessing ? (
            <div className="spinner" />
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          )}
        </div>

        {run.isProcessing ? (
          <>
            <h2 className="empty-title">Converting to 3D Model…</h2>
            <p className="empty-legend">S3 backend is generating textured GLB</p>
          </>
        ) : run.isUploading ? (
          <>
            <h2 className="empty-title">Uploading ZIP… {run.uploadProgress}%</h2>
            <p className="empty-legend">Filtering out MP4 and sending photogrammetry files</p>
          </>
        ) : (
          <>
            <h2 className="empty-title">
              {run.projectName ? `Upload ZIP for "${run.projectName}"` : 'Upload ZIP Archive'}
            </h2>
            <p className="empty-legend">Drop .zip (contains .obj, .mtl, .jpg — .mp4 ignored)</p>
          </>
        )}
      </div>

      {(run.isUploading || model.loadProgress !== null) && (
        <div className="loading-bar">
          <div
            className="progress"
            style={{
              width: `${run.isUploading ? run.uploadProgress : model.loadProgress || 0}%`,
            }}
          />
        </div>
      )}

      {(run.error || model.error) && (
        <div className="error-text">{run.error || model.error}</div>
      )}
    </div>
  );
});
