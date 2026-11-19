import { observer } from 'mobx-react-lite';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { useModalDialog } from '@/hooks/useModalDialog';
import { useStores } from '@/hooks/useStores';

interface VideoDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen overlay that plays the project's original video. */
export const VideoDialog = observer(function VideoDialog({ open, onClose }: VideoDialogProps) {
  const { project } = useStores();
  const ref = useModalDialog(open);
  const titleId = useId();
  /** One automatic retry per opening when playback fails (usually an expired link). */
  const retried = useRef(false);

  // Links expire, so fetch a fresh one each time the overlay opens.
  useEffect(() => {
    if (!open) return;
    retried.current = false;
    void project.refreshVideo();
  }, [open, project]);

  const handleVideoError = () => {
    if (retried.current) return;
    retried.current = true;
    void project.refreshVideo();
  };

  const retryButton = (label: string) => (
    <Button size="sm" variant="secondary" onClick={() => void project.refreshVideo()}>
      {label}
    </Button>
  );

  const { videoStatus, videoUrl, isLoadingVideo, videoError } = project;
  let body: ReactNode;
  if (videoError) {
    body = message(videoError, retryButton('Try again'));
  } else if (videoStatus === 'stored' && videoUrl) {
    body = (
      <video
        key={videoUrl}
        src={videoUrl}
        controls
        autoPlay
        playsInline
        onError={handleVideoError}
        className="max-h-[calc(100dvh-8rem)] w-full rounded-lg bg-black"
      />
    );
  } else if (isLoadingVideo) {
    body = (
      <div className="flex aspect-video w-full items-center justify-center">
        <Spinner className="size-8 text-white" label="Loading video" />
      </div>
    );
  } else if (videoStatus === 'uploading') {
    body = message(
      'The original video is still being saved. Check back in a few minutes.',
      retryButton('Check again'),
    );
  } else {
    body = message("The original video couldn't be saved. The 3D model isn't affected.");
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-5xl bg-transparent p-0 text-white backdrop:bg-gray-950/85"
    >
      <div className="flex items-center justify-between gap-4 pb-3">
        <h2 id={titleId} className="truncate text-sm font-semibold">
          Original video{project.name ? ` · ${project.name}` : ''}
        </h2>
        <IconButton
          icon={X}
          label="Close"
          onClick={onClose}
          className="text-gray-300 hover:bg-white/10 hover:text-white"
        />
      </div>
      {/* Mounted only while open, so closing stops playback. */}
      {open && body}
    </dialog>
  );
});

function message(text: string, action?: ReactNode) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-lg bg-gray-900 p-6 text-center">
      <p className="max-w-sm text-sm text-gray-200">{text}</p>
      {action}
    </div>
  );
}
