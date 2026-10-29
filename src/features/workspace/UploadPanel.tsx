import { observer } from 'mobx-react-lite';
import { CheckCircle2, Circle } from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/utils/cn';
import { UPLOAD_STAGES } from './steps';

/** Centre card shown over the empty viewport until the model is in the viewer. */
export const UploadPanel = observer(function UploadPanel() {
  const { project, model } = useStores();
  const stage = project.uploadStage;
  const error = project.uploadError ?? model.error;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas bg-[radial-gradient(var(--color-gray-300)_1px,transparent_1px)] bg-size-[24px_24px] p-4">
      <section className="flex max-h-full w-full max-w-md flex-col gap-5 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        {project.isOpening ? (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Spinner className="text-blue-600" />
            Opening project…
          </div>
        ) : stage ? (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">
                {stage.index === 1 ? 'Creating your 3D model' : stage.index === 0 ? 'Uploading your video' : 'Loading your model'}
              </h2>
              <p className="text-sm text-gray-600">
                {stage.index === 1
                  ? 'This can take up to 15 minutes. Progress may pause while the model is being built.'
                  : stage.index === 0
                    ? 'Upload progress is shown below.'
                    : 'Preparing the model for the viewer…'}
              </p>
            </div>

            <ProgressBar value={stage.percent} label={stage.label} />

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

            {project.uploadError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {project.uploadError}
              </p>
            )}
            {project.isProcessing && project.uploadError && (
              <Button className="self-end" onClick={project.retryProcessing}>
                Retry status check
              </Button>
            )}
            {project.canCancelUpload && (
              <Button className="self-end" onClick={project.cancelUpload}>
                Cancel upload
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Upload a video</h2>
              <p className="text-sm text-gray-600">
                Upload a video of the object. Model creation runs in the background and can take several minutes.
              </p>
            </div>
            <Dropzone
              accept=".mp4,.mov,.avi,.wmv,.mpg,.mpeg"
              onFile={project.uploadFile}
              hint="MP4, MOV, AVI, WMV, MPG or MPEG · max 300 MB"
              disabled={!project.canUploadVideo}
            />
            <div className="rounded-lg bg-blue-50 px-3 py-3 text-sm text-blue-900">
              <p className="font-medium">Recording tips</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-blue-800">
                <li>Walk slowly around the object for 30–60 seconds; keep zoom fixed.</li>
                <li>Keep the object sharp and well lit; avoid motion blur.</li>
                <li>Matte, textured objects and backgrounds work best.</li>
              </ul>
            </div>
            {!project.captureAvailable && (
              <div className="flex flex-col gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <p role="status">
                  {project.isCheckingHealth
                    ? 'Checking video processing availability…'
                    : project.captureMessage ?? 'Video processing is unavailable.'}
                </p>
                {!project.isCheckingHealth && (
                  <Button size="sm" className="self-start" onClick={project.checkHealth}>
                    Check again
                  </Button>
                )}
              </div>
            )}
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
