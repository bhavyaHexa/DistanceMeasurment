import { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Html, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import * as THREE from 'three';
import { useStores } from '../../stores/StoreContext';
import { ModelViewer } from './ModelViewer';
import { MeasurementOverlay } from './MeasurementOverlay'; // Trigger TS server reload

export const SceneCanvas = observer(function SceneCanvas() {
  const { model } = useStores();
  const controlsRef = useRef<any>(null);

  const gridSize = model.isLoaded ? Math.max(10, Math.ceil(model.boundingSphereRadius * 5)) : 10;
  const gridDivisions = model.isLoaded ? 50 : 10;

  useEffect(() => {
    if (model.isLoaded && model.scene && controlsRef.current) {
      // Calculate the bounding box of the scene AFTER it has been translated
      const box = new THREE.Box3().setFromObject(model.scene);
      
      // Update maxDistance to ensure we can zoom out enough for huge models
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      controlsRef.current.maxDistance = sphere.radius * 10;
      controlsRef.current.minDistance = sphere.radius * 0.01;
      
      // Fit the camera to the bounding box with a smooth transition
      controlsRef.current.fitToBox(box, true);
    }
  }, [model.isLoaded, model.scene]);

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 50, near: 0.01, far: 100000 }}>
      <color attach="background" args={['#141417']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      <Suspense fallback={<Html center>Loading model…</Html>}>
        {model.objectUrl && <ModelViewer url={model.objectUrl} />}
        <MeasurementOverlay />
      </Suspense>

      <CameraControls ref={controlsRef} makeDefault minDistance={0.05} maxDistance={5000} />

      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport />
      </GizmoHelper>

      <gridHelper args={[gridSize, gridDivisions]} />
    </Canvas>
  );
});
