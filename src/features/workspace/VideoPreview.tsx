import { observer } from 'mobx-react-lite';
import { Play } from 'lucide-react';
import { useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { useStores } from '@/hooks/useStores';
import { VideoDialog } from './VideoDialog';

function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Small thumbnail of the original video over the viewport; opens the full player on click.
 * Sits left of the axes gizmo, which SceneCanvas draws 64px in from the top-right corner.
 */
export const VideoPreview = observer(function VideoPreview() {
  const { project } = useStores();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** The link may have expired since the project was opened: fetch a fresh one once. */
  const retried = useRef(false);

  const { videoStatus, videoUrl } = project;
  if (videoStatus !== 'stored' && videoStatus !== 'uploading') return null;

  const playPreview = () => {
    const video = videoRef.current;
    if (video) void video.play().catch(() => {});
  };
  const stopPreview = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0.1;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={playPreview}
        onMouseLeave={stopPreview}
        onFocus={playPreview}
        onBlur={stopPreview}
        aria-label="Play original video"
        className="group absolute top-4 right-32 w-40 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600 sm:w-48"
      >
        <div className="relative aspect-video bg-gray-900">
          {videoStatus === 'stored' && videoUrl ? (
            <>
              <video
                ref={videoRef}
                key={videoUrl}
                // The fragment makes browsers render the first frame as a thumbnail.
                src={`${videoUrl}#t=0.1`}
                muted
                loop
                playsInline
                preload="metadata"
                tabIndex={-1}
                aria-hidden
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                onError={() => {
                  if (retried.current) return;
                  retried.current = true;
                  void project.refreshVideo();
                }}
                className="size-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity group-hover:opacity-0">
                <span className="flex size-9 items-center justify-center rounded-full bg-white/90 shadow">
                  <Play aria-hidden className="ml-0.5 size-4 fill-gray-900 text-gray-900" />
                </span>
              </span>
              {duration !== null && Number.isFinite(duration) && (
                <span className="absolute right-1.5 bottom-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white tabular-nums">
                  {formatDuration(duration)}
                </span>
              )}
            </>
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-1.5 text-gray-300">
              <Spinner className="size-4" />
              <span className="text-[11px]">Saving video…</span>
            </span>
          )}
        </div>
        <span className="block px-2.5 py-1.5 text-xs font-medium text-gray-700">Original video</span>
      </button>
      <VideoDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
});
