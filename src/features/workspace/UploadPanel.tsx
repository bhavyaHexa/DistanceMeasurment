import { observer } from 'mobx-react-lite';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dropzone } from '@/components/ui/Dropzone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/utils/cn';
import { SCAN_HINT } from '@/utils/zip';
import { UPLOAD_STAGES } from './steps';

/** Centre card shown over the empty viewport until the model is in the viewer. */
export const UploadPanel = observer(function UploadPanel() {
  const { project, model } = useStores();
  const stage = project.uploadStage;
  const error = project.uploadError ?? model.error;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas bg-[radial-gradient(var(--color-gray-300)_1px,transparent_1px)] bg-size-[24px_24px] p-4">
      <section className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        {project.isOpening ? (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Spinner className="text-blue-600" />
            Opening project…
          </div>
        ) : stage ? (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Preparing your model</h2>
              <p className="text-sm text-gray-600">This can take a few minutes. Keep this tab open.</p>
            </div>

            <ProgressBar value={stage.percent} label={UPLOAD_STAGES[stage.index]} />

            <ol className="flex flex-col gap-3 text-sm">
              {UPLOAD_STAGES.map((label, index) => (
                <li
                  key={label}
                  className={cn(
                    'flex items-center gap-2.5',
                    index < stage.index && 'text-gray-700',
                    index === stage.index && 'font-medium text-gray-900',
                    index > stage.index && 'text-gray-500',
                  )}
                >
                  {index < stage.index ? (
                    <CheckCircle2 aria-hidden className="size-[18px] text-green-700" />
                  ) : index === stage.index ? (
                    <Spinner className="size-[18px] text-blue-600" />
                  ) : (
                    <Circle aria-hidden className="size-[18px] text-gray-300" />
                  )}
                  {label}
                  {index === stage.index && stage.percent !== null && (
                    <span className="ml-auto font-normal text-gray-600">{stage.percent}%</span>
                  )}
                </li>
              ))}
            </ol>

            {project.canCancelUpload && (
              <Button className="self-end" onClick={project.cancelUpload}>
                Cancel upload
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Upload your scan</h2>
              <p className="text-sm text-gray-600">Add the scan ZIP for this project to build its 3D model.</p>
            </div>
            <Dropzone accept=".zip" onFile={project.uploadFile} hint={SCAN_HINT} />
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
});
