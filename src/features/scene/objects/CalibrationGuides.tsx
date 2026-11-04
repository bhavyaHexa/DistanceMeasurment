import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import { CALIBRATION_COLOR } from '@/utils/measureColors';
import { DraggablePointMarker } from './DraggablePointMarker';
import { SegmentLine } from './SegmentLine';

/** Draft calibration points A/B and the line between them. The chosen scaling is not drawn. */
export const CalibrationGuides = observer(function CalibrationGuides() {
  const { calibration } = useStores();
  const { a, b } = calibration.draft;

  return (
    <group>
      {a && b && <SegmentLine a={a} b={b} color={CALIBRATION_COLOR} highlighted />}
      {a && <DraggablePointMarker target={{ kind: 'calibration', end: 'a' }} position={a} color={CALIBRATION_COLOR} label="A" />}
      {b && <DraggablePointMarker target={{ kind: 'calibration', end: 'b' }} position={b} color={CALIBRATION_COLOR} label="B" />}
    </group>
  );
});
