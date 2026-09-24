import { Toolbar } from '../UI/Toolbar';
import { DropzoneOverlay } from '../UI/DropzoneOverlay';
import { CalibrationPanel } from '../UI/CalibrationPanel';
import { MeasurementList } from '../UI/MeasurementList';
import { SceneCanvas } from '../Scene/SceneCanvas';

export function AppLayout() {
  return (
    <div className="app-layout">
      <header>
        <Toolbar />
      </header>
      <DropzoneOverlay />
      <main>
        <div className="canvas-pane">
          <SceneCanvas />
          <CalibrationPanel />
        </div>
        <aside>
          <MeasurementList />
        </aside>
      </main>
    </div>
  );
}
