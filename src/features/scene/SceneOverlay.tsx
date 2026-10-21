import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import { CalibrationGuides } from './objects/CalibrationGuides';
import { MeasurementObject } from './objects/MeasurementObject';
import { SnapIndicator } from './objects/SnapIndicator';

/** Everything drawn on top of the model: calibration points, measurements and the snap ring. */
export const SceneOverlay = observer(function SceneOverlay() {
  const { measurements, viewer, workspace } = useStores();

  return (
    <group>
      {workspace.step === 'calibrate' && <CalibrationGuides />}
      {workspace.step === 'measure' &&
        measurements.items.map((m) => <MeasurementObject key={m.id} measurement={m} />)}
      {viewer.snapPreview && <SnapIndicator position={viewer.snapPreview} />}
    </group>
  );
});
