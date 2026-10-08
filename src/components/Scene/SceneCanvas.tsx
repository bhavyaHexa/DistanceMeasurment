import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, Bounds, useBounds } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import * as THREE from 'three';
import { useStores } from '../../stores/StoreContext';
import { ModelViewer } from './ModelViewer';
import { MeasurementOverlay } from './MeasurementOverlay';

const FitController = observer(function FitController() {
  const { ui, model } = useStores();
  const bounds = useBounds();

  useEffect(() => {
    if (model.isLoaded && ui.fitRequest >= 0) {
      bounds.refresh().fit();
    }
  }, [ui.fitRequest, model.isLoaded, bounds]);

  return null;
});

export const SceneCanvas = observer(function SceneCanvas() {
  const { ui, model, measurement } = useStores();

  const gridSize = model.isLoaded ? Math.max(10, Math.ceil(model.boundingSphereRadius * 5)) : 10;
  const gridDivisions = model.isLoaded ? 50 : 10;

  let cursor = 'default';
  if (measurement.draggingId) {
    cursor = 'grabbing';
  } else if (ui.step === 'calibrate' || ui.step === 'measure') {
    cursor = 'crosshair';
  }

  const MOUSE = THREE.MOUSE;

  return (
    <Canvas 
      camera={{ position: [3, 3, 3], fov: 50, near: 0.0001, far: 100000 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      style={{ cursor }}
    >
      <color attach="background" args={['#F1EEF9']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      <Suspense fallback={null}>
        <Bounds fit observe margin={1.2}>
          {model.file && <ModelViewer url={model.file.url} />}
          <FitController />
        </Bounds>
        <MeasurementOverlay />
      </Suspense>

      <OrbitControls 
        makeDefault 
        enabled={!measurement.draggingId}
        minDistance={0.0001}
        zoomSpeed={3}
        mouseButtons={{
          LEFT: ui.viewTool === 'pan' ? MOUSE.PAN : MOUSE.ROTATE,
          MIDDLE: MOUSE.DOLLY,
          RIGHT: MOUSE.PAN
        }}
      />

      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport />
      </GizmoHelper>

      <gridHelper 
        args={[gridSize, gridDivisions, '#C9C1E6', '#D8D1EE']} 
        position={[0, -0.01, 0]}
      />
    </Canvas>
  );
});
