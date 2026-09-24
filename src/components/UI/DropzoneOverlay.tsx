import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';

export const DropzoneOverlay = observer(function DropzoneOverlay() {
  const { model } = useStores();

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) model.setFile(accepted[0]);
    },
    [model],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'model/gltf-binary': ['.glb'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={
        model.isLoaded
          ? `dropzone dropzone-bar ${isDragActive ? 'is-active' : ''}`
          : `dropzone dropzone-full ${isDragActive ? 'is-active' : ''}`
      }
    >
      <input {...getInputProps()} />
      {model.isLoaded ? (
        <span>Loaded: {model.fileName} — drop a new .glb to replace</span>
      ) : (
        <div className="dropzone-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#f4f4f5' }}>Drag & drop a 3D model (.glb)</div>
          <div style={{ fontSize: '13px' }}>or click to browse from your computer</div>
        </div>
      )}
    </div>
  );
});
