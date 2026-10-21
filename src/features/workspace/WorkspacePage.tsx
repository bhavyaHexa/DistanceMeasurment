import { observer } from 'mobx-react-lite';
import { Link } from 'react-router';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { useStores } from '@/hooks/useStores';
import { PROJECTS_PATH } from '@/app/routes';
import { CalibrationPanel } from '@/features/calibration/CalibrationPanel';
import { MeasurementPanel } from '@/features/measurements/MeasurementPanel';
import { SceneCanvas } from '@/features/scene/SceneCanvas';
import { useWorkspacePage } from './hooks/useWorkspacePage';
import { TopBar } from './TopBar';
import { UploadPanel } from './UploadPanel';
import { ViewportControls } from './ViewportControls';

export const WorkspacePage = observer(function WorkspacePage() {
  const { project, workspace } = useStores();
  useWorkspacePage();

  if (project.openError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-lg font-semibold">Couldn't open this project</h1>
        <p className="max-w-sm text-sm text-gray-600">{project.openError}</p>
        <Link to={PROJECTS_PATH} className={buttonClasses('secondary')}>
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative min-h-[50dvh] min-w-0 flex-1 bg-canvas">
          <SceneCanvas />
          {workspace.step === 'upload' ? <UploadPanel /> : <ViewportControls />}
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
