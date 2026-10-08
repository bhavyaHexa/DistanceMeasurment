import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { DraggablePointMarker } from './DraggablePointMarker';
import { PointMarker } from './PointMarker';
import { MeasurementLine } from './MeasurementLine';
import { MeasurementLabel } from './MeasurementLabel';
import { DeltaLines } from './DeltaLines';
import { MeasurementDetailBox } from './MeasurementDetailBox';
import { MEASURE_COLORS } from '../../utils/measureColors';

export const MeasurementOverlay = observer(function MeasurementOverlay() {
  const { measurement, ui } = useStores();

  return (
    <group>
      {/* 1. Calibrate step */}
      {ui.step === 'calibrate' && (
        <group>
          {measurement.calDraft.a && measurement.calDraft.b && (
            <MeasurementLine 
              a={measurement.calDraft.a} 
              b={measurement.calDraft.b} 
              color="var(--cal-line)" 
            />
          )}
          {measurement.calDraft.a && (
            <DraggablePointMarker id="cal" end="a" position={measurement.calDraft.a} isCal />
          )}
          {measurement.calDraft.b && (
            <DraggablePointMarker id="cal" end="b" position={measurement.calDraft.b} isCal />
          )}
        </group>
      )}

      {/* 2. Measure step */}
      {ui.step === 'measure' && measurement.measurements.map(m => {
        if (!m.visible) return null;
        const color = MEASURE_COLORS[m.colorIndex % MEASURE_COLORS.length].line;
        const isSelected = measurement.selectedId === m.id;
        const isDraggingThis = measurement.draggingId === m.id;
        
        return (
          <group key={m.id}>
            <MeasurementLine a={m.a} b={m.b} color={color} isHover={isSelected && !measurement.draggingId} />
            <MeasurementLabel m={m} />
            
            {isSelected ? (
              <>
                <DraggablePointMarker id={m.id} end="a" position={m.a} color={color} />
                <DraggablePointMarker id={m.id} end="b" position={m.b} color={color} />
                {ui.showAxisLines && !isDraggingThis && <DeltaLines m={m} />}
                {!isDraggingThis && <MeasurementDetailBox m={m} />}
              </>
            ) : (
              <>
                <PointMarker position={m.a} color={color} />
                <PointMarker position={m.b} color={color} />
              </>
            )}
          </group>
        );
      })}

      {/* 3. Pending Measurement */}
      {ui.step === 'measure' && measurement.pendingA && (
        <group>
          <PointMarker position={measurement.pendingA} color={MEASURE_COLORS[measurement.nextColorIndex % MEASURE_COLORS.length].line} />
          {measurement.hoverPoint && (
            <>
              <MeasurementLine 
                a={measurement.pendingA} 
                b={measurement.hoverPoint} 
                color={MEASURE_COLORS[measurement.nextColorIndex % MEASURE_COLORS.length].line} 
                dashed 
              />
              <MeasurementLabel 
                m={{ id: 'pending', name: '', a: measurement.pendingA, b: measurement.hoverPoint, colorIndex: measurement.nextColorIndex, visible: true, rawDistance: 0 }} 
              />
            </>
          )}
        </group>
      )}

      {/* Snap ring */}
      {ui.snapToEdges && measurement.hoverPoint && !measurement.draggingId && (
        <PointMarker position={measurement.hoverPoint} color="var(--primary-strong)" isSnap />
      )}
    </group>
  );
});
