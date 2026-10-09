import { useEffect, useRef } from 'react';
import { useGLTF, useProgress } from '@react-three/drei';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { disposeObject3D } from '../../utils/disposeObject';
import { snapToVertex } from '../../utils/snap';

export const ModelViewer = observer(function ModelViewer({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const { model, measurement, ui } = useStores();
  const sceneRef = useRef(gltf.scene);
  const pointerDownPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const { progress } = useProgress();
  const { size } = useThree();

  useEffect(() => {
    if (!model.isLoaded && model.loadProgress !== null) {
      model.setProgress(progress);
    }
  }, [progress, model]);

  useEffect(() => {
    if (gltf.scene) {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      model.setLoaded(box);
      model.setScene(gltf.scene);

      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.x -= center.x;
      gltf.scene.position.z -= center.z;
      gltf.scene.position.y -= box.min.y;

      ui.requestFit();
    }
    return () => {
      model.setScene(null);
      disposeObject3D(sceneRef.current);
    };
  }, [gltf, model, ui]);

  const getHitPoint = (e: ThreeEvent<PointerEvent>) => {
    if (!ui.snapToEdges || !e.intersections || e.intersections.length === 0) {
      return { point: [e.point.x, e.point.y, e.point.z] as [number, number, number], snapped: false };
    }
    const hit = e.intersections[0];
    return snapToVertex(hit, e.camera as THREE.PerspectiveCamera, size, e.pointer);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (measurement.draggingId) return;
    if ((ui.step === 'calibrate' && measurement.isAddingCal) || (ui.step === 'measure' && measurement.activeMeasureId !== null)) {
      e.stopPropagation();
      const res = getHitPoint(e);
      measurement.setHoverPoint(res.point);
      // Optional: pass res.snapped to the store if you want a visual snap ring
    } else {
      measurement.setHoverPoint(null);
    }
  };

  const handlePointerLeave = () => {
    measurement.setHoverPoint(null);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!pointerDownPos.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const dt = Date.now() - pointerDownPos.current.time;
    pointerDownPos.current = null;

    // Allow up to 15 pixels of movement and 500ms for a click to make placement smoother
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 500) {
      e.stopPropagation();
      const res = getHitPoint(e);
      
      if (ui.step === 'calibrate' && measurement.isAddingCal) {
        measurement.placeCalPoint(res.point);
      } else if (ui.step === 'measure' && measurement.activeMeasureId !== null) {
        measurement.placePoint(res.point);
      }
    }
  };

  const handlePointerMissed = () => {
    if (ui.step === 'measure') {
      measurement.select(null);
    }
  };

  return (
    <primitive
      object={gltf.scene}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerMissed={handlePointerMissed}
    />
  );
});
