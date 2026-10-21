import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import type * as THREE from 'three';
import { useStores } from '@/hooks/useStores';
import { disposeObject3D, placeOnGround } from '@/utils/three';

/** Reports download progress, sits the model on the grid centred at the origin, and frames it. */
export function useModelSetup(scene: THREE.Object3D) {
  const { model, viewer } = useStores();
  const { progress } = useProgress();

  useEffect(() => {
    model.setProgress(Math.round(progress));
  }, [progress, model]);

  useEffect(() => {
    model.setLoaded(scene, placeOnGround(scene));
    viewer.requestFit();
    return () => disposeObject3D(scene);
  }, [scene, model, viewer]);
}
