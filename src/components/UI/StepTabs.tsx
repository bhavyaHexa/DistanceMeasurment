import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import './Toolbar.css';

export const StepTabs = observer(function StepTabs() {
  const { ui, model, measurement } = useStores();
  const step = ui.step;

  const isModelLoaded = model.isLoaded;
  const isCalibrated = measurement.isCalibrated;

  return (
    <div className="step-tabs">
      <button 
        className={`step-tab ${step === 'load' ? 'active' : isModelLoaded ? 'done' : ''}`}
        aria-current={step === 'load' ? 'step' : undefined}
        onClick={() => {
          // Trigger replace file logic by clicking the hidden file input in Toolbar
          document.getElementById('replace-file-input')?.click();
        }}
      >
        <span className="step-num">1</span>
        <span className="step-label">Load</span>
        {isModelLoaded && <span className="step-check">✓</span>}
      </button>

      <button 
        className={`step-tab ${step === 'calibrate' ? 'active' : isCalibrated ? 'done' : ''}`}
        aria-current={step === 'calibrate' ? 'step' : undefined}
        aria-disabled={!isModelLoaded}
        title={!isModelLoaded ? "Load a model first" : undefined}
        onClick={() => {
          if (isModelLoaded && step !== 'calibrate') {
            ui.goToCalibrate();
          }
        }}
      >
        <span className="step-num">2</span>
        <span className="step-label">Calibrate</span>
        {isCalibrated && <span className="step-check">✓</span>}
      </button>

      <button 
        className={`step-tab ${step === 'measure' ? 'active' : ''}`}
        aria-current={step === 'measure' ? 'step' : undefined}
        aria-disabled={!isCalibrated}
        title={!isCalibrated ? "Calibrate the scale first" : undefined}
        onClick={() => {
          if (isCalibrated && step !== 'measure') {
            ui.goToMeasure();
          }
        }}
      >
        <span className="step-num">3</span>
        <span className="step-label">Measure</span>
      </button>
    </div>
  );
});
