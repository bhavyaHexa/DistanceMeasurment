import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Html, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { ModelViewer } from './ModelViewer';
import { MeasurementOverlay } from './MeasurementOverlay'; // Trigger TS server reload

export const SceneCanvas = observer(function SceneCanvas() {
  const { model } = useStores();

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 50, near: 0.01, far: 10000 }}>
      <color attach="background" args={['#141417']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      <Suspense fallback={<Html center>Loading model…</Html>}>
        {model.objectUrl && <ModelViewer url={model.objectUrl} />}
        <MeasurementOverlay />
      </Suspense>

      <CameraControls makeDefault minDistance={0.05} maxDistance={5000} />

      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport />
      </GizmoHelper>

      <gridHelper args={[10, 10]} />
    </Canvas>
  );
});
