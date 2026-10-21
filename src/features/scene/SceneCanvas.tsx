import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { MOUSE } from 'three';
import { useStores } from '@/hooks/useStores';
import { FitController } from './FitController';
import { ModelViewer } from './ModelViewer';
import { SceneOverlay } from './SceneOverlay';

const CAMERA = { position: [3, 3, 3] as [number, number, number], fov: 50, near: 0.0001, far: 100000 };
const BACKGROUND = '#eef0f3';
const GRID_COLORS = ['#c4c9d2', '#dde1e7'] as const;

export const SceneCanvas = observer(function SceneCanvas() {
  const { model, viewer } = useStores();
  const { size, divisions } = model.grid;

  return (
    <Canvas
      camera={CAMERA}
      dpr={[1, 2]}
      gl={{ antialias: true, logarithmicDepthBuffer: true }}
      style={{ position: 'absolute', inset: 0, cursor: viewer.cursor }}
    >
      <color attach="background" args={[BACKGROUND]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      <Suspense fallback={null}>
        <Bounds margin={1.2}>
          {model.url && <ModelViewer url={model.url} />}
          <FitController />
        </Bounds>
        <SceneOverlay />
      </Suspense>

      <OrbitControls
        makeDefault
        enabled={!viewer.isDragging}
        minDistance={0.0001}
        zoomSpeed={3}
        mouseButtons={{
          LEFT: viewer.viewTool === 'pan' ? MOUSE.PAN : MOUSE.ROTATE,
          MIDDLE: MOUSE.DOLLY,
          RIGHT: MOUSE.PAN,
        }}
      />

      <GizmoHelper alignment="top-right" margin={[64, 64]}>
        <GizmoViewport />
      </GizmoHelper>

      <gridHelper args={[size, divisions, ...GRID_COLORS]} position={[0, -0.01, 0]} />
    </Canvas>
  );
});
