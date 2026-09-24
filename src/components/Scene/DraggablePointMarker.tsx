import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';

interface Props {
  measurementId: string;
  which: 'A' | 'B';
  position: THREE.Vector3;
  color: string;
}

const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export const DraggablePointMarker = observer(function DraggablePointMarker({
  measurementId,
  which,
  position,
  color,
}: Props) {
  const { model, measurement } = useStores();
  const { camera, gl, controls } = useThree();

  const radius = Math.max(model.boundingSphereRadius * 0.01, 0.003);
  const isDragging = useRef(false);

  /** Convert a DOM PointerEvent to normalised device coords [-1, 1] */
  const toNDC = useCallback(
    (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      _mouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    },
    [gl],
  );

  const onPointerDown = useCallback(
    (e: any) => {
      // Only allow dragging when idle (not placing new points)
      if (measurement.mode !== 'idle') return;

      e.stopPropagation();
      isDragging.current = true;

      // Disable orbit/pan so camera doesn't move during point drag
      if (controls) {
        (controls as any).enabled = false;
      }

      gl.domElement.style.cursor = 'grabbing';

      const onMove = (ev: PointerEvent) => {
        if (!isDragging.current) return;
        const modelScene = model.scene;
        if (!modelScene) return;

        toNDC(ev);
        _raycaster.setFromCamera(_mouse, camera);

        // Collect all renderable meshes inside the loaded model
        const targets: THREE.Mesh[] = [];
        modelScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) targets.push(child as THREE.Mesh);
        });

        const hits = _raycaster.intersectObjects(targets, false);
        if (hits.length > 0) {
          measurement.movePoint(measurementId, which, hits[0].point);
        }
      };

      const onUp = () => {
        isDragging.current = false;
        if (controls) (controls as any).enabled = true;
        gl.domElement.style.cursor = '';
        gl.domElement.removeEventListener('pointermove', onMove);
        gl.domElement.removeEventListener('pointerup', onUp);
      };

      gl.domElement.addEventListener('pointermove', onMove);
      gl.domElement.addEventListener('pointerup', onUp);
    },
    [camera, controls, gl, measurement, measurementId, model, toNDC, which],
  );

  return (
    <mesh
      position={position}
      renderOrder={999}
      onPointerDown={onPointerDown}
      onPointerOver={() => {
        if (measurement.mode === 'idle') gl.domElement.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        if (!isDragging.current) gl.domElement.style.cursor = '';
      }}
    >
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial color={color} depthTest={false} />
    </mesh>
  );
});
