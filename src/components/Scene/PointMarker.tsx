import * as THREE from 'three';
import { useStores } from '../../stores/StoreContext';
import { observer } from 'mobx-react-lite';

export const PointMarker = observer(function PointMarker({
  position,
  color,
}: {
  position: THREE.Vector3;
  color: string;
}) {
  const { model } = useStores();
  const radius = Math.max(model.boundingSphereRadius * 0.008, 0.002);

  return (
    <mesh position={position} renderOrder={999}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial color={color} depthTest={false} />
    </mesh>
  );
});
