import { observer } from 'mobx-react-lite';
import { Select } from '@/components/ui/Select';
import { useStores } from '@/hooks/useStores';
import { CALIBRATION_MODES, calibrationMode } from '@/utils/calibrationModes';

const TITLES = CALIBRATION_MODES.map((m) => m.title);

/** Dropdown for which distance between A and B the entered real length refers to. */
export const CalibrationModeSwitch = observer(function CalibrationModeSwitch() {
  const { calibration } = useStores();
  const current = calibrationMode(calibration.draftMode);

  return (
    <Select
      label="Scale by"
      className="flex-col items-stretch gap-1.5"
      value={current.title}
      options={TITLES}
      onChange={(title) => {
        const next = CALIBRATION_MODES.find((m) => m.title === title);
        if (next) calibration.setDraftMode(next.mode);
      }}
    />
  );
});
