import { observer } from 'mobx-react-lite';
import { PanelHeader } from '@/components/PanelHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useStores } from '@/hooks/useStores';
import { CalibrationPointRow } from './CalibrationPointRow';

export const CalibrationPanel = observer(function CalibrationPanel() {
  const { calibration, workspace } = useStores();

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        workspace.applyCalibration();
      }}
    >
      <PanelHeader
        title="Set scale"
        description="Click two points whose real vertical distance you know, such as a marked height or a floor-to-ceiling span."
      />

      <ol className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <CalibrationPointRow end="a" />
        <CalibrationPointRow end="b" />
        <li className="pt-2">
          <TextField
            label="Real vertical distance A → B"
            inputMode="decimal"
            placeholder="0.00"
            value={calibration.lengthInput}
            onValueChange={calibration.setLengthInput}
            suffix={workspace.displayUnit}
          />
        </li>
      </ol>

      <div className="flex gap-3 border-t border-gray-200 px-5 py-4">
        {calibration.isCalibrated && (
          <Button size="lg" className="flex-1" onClick={workspace.cancelCalibration}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" variant="primary" className="flex-1" disabled={!calibration.canApply}>
          Apply scale
        </Button>
      </div>
    </form>
  );
});
