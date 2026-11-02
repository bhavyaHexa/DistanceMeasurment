import { useGLTF } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { PROJECTS_PATH } from '@/app/routes';
import { LogoMark } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Dropzone } from '@/components/ui/Dropzone';
import { Select } from '@/components/ui/Select';
import { CalibrationPanel } from '@/features/calibration/CalibrationPanel';
import { MeasurementPanel } from '@/features/measurements/MeasurementPanel';
import { SceneCanvas } from '@/features/scene/SceneCanvas';
import { ViewportControls } from '@/features/workspace/ViewportControls';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useStores } from '@/hooks/useStores';
import { UNITS } from '@/utils/units';

/** Standalone page: pick a local GLB and go straight into scale setting and measuring. */
export const TestUploadPage = observer(function TestUploadPage() {
  const { model, calibration, measurements, viewer, workspace, history } = useStores();
  const [fileError, setFileError] = useState<string | null>(null);
  const blobUrl = useRef<string | null>(null);
  useKeyboardShortcuts();

  const clearModel = useCallback(() => {
    if (blobUrl.current) {
      useGLTF.clear(blobUrl.current);
      URL.revokeObjectURL(blobUrl.current);
      blobUrl.current = null;
    }
    model.reset();
    calibration.reset();
    measurements.reset();
    viewer.reset();
    workspace.reset();
    history.clear();
  }, [model, calibration, measurements, viewer, workspace, history]);

  useEffect(() => {
    clearModel();
    return clearModel;
  }, [clearModel]);

  const onFile = (file: File) => {
    if (!/\.glb$/i.test(file.name)) {
      setFileError('Please choose a .glb file.');
      return;
    }
    setFileError(null);
    clearModel();
    blobUrl.current = URL.createObjectURL(file);
    model.load(blobUrl.current);
  };

  const hasModel = model.url !== null;
  const error = fileError ?? model.error;

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2.5 text-sm">
          <Link to={PROJECTS_PATH} aria-label="All projects">
            <LogoMark />
          </Link>
          <span className="font-semibold text-gray-900">Test upload</span>
        </div>
        <div className="flex items-center gap-3">
          {workspace.step !== 'upload' && (
            <Select
              label="Units"
              hideLabel
              value={workspace.displayUnit}
              options={UNITS}
              onChange={workspace.setDisplayUnit}
            />
          )}
          {hasModel && (
            <Button size="sm" onClick={clearModel}>
              Load another model
            </Button>
          )}
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative min-h-[50dvh] min-w-0 flex-1 bg-canvas">
          <SceneCanvas />
          {workspace.step === 'upload' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-canvas p-4">
              <section className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                <h2 className="text-base font-semibold">Upload a 3D model</h2>
                <Dropzone
                  accept=".glb"
                  onFile={onFile}
                  hint="GLB file"
                  disabled={hasModel && !model.error}
                />
                {hasModel && !model.error && (
                  <p role="status" className="text-sm text-gray-600">
                    Loading model{model.loadProgress !== null ? ` · ${Math.round(model.loadProgress)}%` : '…'}
                  </p>
                )}
                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
              </section>
            </div>
          ) : (
            <ViewportControls />
          )}
        </main>
        {workspace.step !== 'upload' && (
          <aside className="flex max-h-[50dvh] shrink-0 flex-col border-t border-gray-200 bg-white lg:max-h-none lg:w-[340px] lg:border-t-0 lg:border-l">
            {workspace.step === 'calibrate' ? <CalibrationPanel /> : <MeasurementPanel />}
          </aside>
        )}
      </div>
    </div>
  );
});
