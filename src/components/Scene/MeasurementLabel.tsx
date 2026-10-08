import { Html } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import type { Measurement } from '../../types/measurement';
import { MEASURE_COLORS } from '../../utils/measureColors';
import './MeasurementLabel.css';

export const MeasurementLabel = observer(function MeasurementLabel({ m }: { m: Measurement }) {
  const { measurement, ui } = useStores();

  const isSelected = measurement.selectedId === m.id;
  const colorObj = MEASURE_COLORS[m.colorIndex % MEASURE_COLORS.length];
  
  const midX = (m.a[0] + m.b[0]) / 2;
  const midY = (m.a[1] + m.b[1]) / 2;
  const midZ = (m.a[2] + m.b[2]) / 2;

  let classes = 'meas-badge';
  if (isSelected) classes += ' active';

  let text = '';
  if (m.id === 'pending') {
    text = measurement.displayValue(m, ui.displayUnit) || '...';
  } else {
    text = measurement.displayValue(m, ui.displayUnit);
  }

  return (
    <Html position={[midX, midY, midZ]} center zIndexRange={[80, 0]} pointerEvents="none">
      <div 
        className={classes} 
        style={{
          '--badge-bg': isSelected ? colorObj.line : colorObj.bg,
          '--badge-color': isSelected ? '#fff' : colorObj.line,
          '--badge-border': colorObj.line
        } as React.CSSProperties}
      >
        {text}
      </div>
    </Html>
  );
});
