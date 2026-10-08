import { Html } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import type { Measurement } from "../../types/measurement";
import { useStores } from "../../stores/StoreContext";
import { format, toUnit } from "../../utils/units";
import "./MeasurementLabel.css";

export const MeasurementDetailBox = observer(function MeasurementDetailBox({
  m,
}: {
  m: Measurement;
}) {
  const { ui, measurement } = useStores();

  const dx = Math.abs(m.a[0] - m.b[0]);
  const dy = Math.abs(m.a[1] - m.b[1]);
  const dz = Math.abs(m.a[2] - m.b[2]);

  const mps = measurement.metersPerSceneUnit;
  // 0.001 is mm. Wait, toUnit handles it.
  // Better: just format the raw value using the same logic as distance
  // Actually, toUnit takes (meters, unit).
  // dx is in scene units. Real dx in meters = dx * mps.

  const fmt = (val: number) => {
    if (mps === null) return val.toFixed(2);
    return format(toUnit(val, mps, ui.displayUnit), ui.displayUnit);
  };

  const posArray = m.b;

  return (
    <Html
      position={posArray as [number, number, number]}
      style={{ transform: "translate(20px, -20px)" }}
      zIndexRange={[110, 0]}
    >
      <div className="detail-box">
        <div className="detail-row">
          <span className="detail-label x">ΔX</span> {fmt(dx)}
        </div>
        <div className="detail-row">
          <span className="detail-label y">ΔY</span> {fmt(dy)}
        </div>
        <div className="detail-row">
          <span className="detail-label z">ΔZ</span> {fmt(dz)}
        </div>
      </div>
    </Html>
  );
});
