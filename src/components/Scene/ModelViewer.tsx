import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { useClickVsDrag } from '../../hooks/useClickVsDrag';
import { disposeObject3D } from '../../utils/disposeObject';

export const ModelViewer = observer(function ModelViewer({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const { model, measurement } = useStores();
  const sceneRef = useRef(gltf.scene);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    model.setLoaded(box);
    // Store a plain (non-observable) ref to the scene so DraggablePointMarker
    // can raycast against it without needing a React context.
    model.setScene(gltf.scene);

    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.x -= center.x;
    gltf.scene.position.z -= center.z;
    gltf.scene.position.y -= box.min.y;

    return () => {
      model.setScene(null);
      disposeObject3D(sceneRef.current);
    };
  }, [gltf, model]);

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    if (measurement.mode === 'idle') return;
    e.stopPropagation();
    measurement.addPoint(e.point);
  };

  const { onPointerDown, onPointerUp } = useClickVsDrag(handleClick);

  return (
    <primitive
      object={gltf.scene}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    />
  );
});
