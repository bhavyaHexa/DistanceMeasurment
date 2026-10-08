import { observer } from 'mobx-react-lite';
import { useStores } from './stores/StoreContext';
import { Toolbar } from './components/UI/Toolbar';
import { DropzoneOverlay } from './components/UI/DropzoneOverlay';
import { CalibrationPanel } from './components/UI/CalibrationPanel';
import { MeasurementList } from './components/UI/MeasurementList';
import { SceneCanvas } from './components/Scene/SceneCanvas';
import { ConfirmDialog } from './components/UI/ConfirmDialog';
import { StatusBar } from './components/UI/StatusBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

const App = observer(function App() {
  const { ui } = useStores();
  const step = ui.step;

  useKeyboardShortcuts();

  return (
    <div className="app">
      <Toolbar />
      <div className="body">
        <main className="viewport">
          <SceneCanvas />
          {step === 'load' && <DropzoneOverlay variant="empty" />}
          {step !== 'load' && <StatusBar />}
          <DropzoneOverlay variant="drag" />
        </main>
        {step === 'calibrate' && (
          <aside className="side-panel">
            <CalibrationPanel />
          </aside>
        )}
        {step === 'measure' && (
          <aside className="side-panel">
            <MeasurementList />
          </aside>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
});

export default App;
