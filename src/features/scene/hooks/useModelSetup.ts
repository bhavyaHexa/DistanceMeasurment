import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import type * as THREE from 'three';
import { useStores } from '@/hooks/useStores';
import { disposeObject3D, legacyPointRemap, makeMatte, placeOnGround } from '@/utils/three';

/**
 * Photogrammetry exports are Z-up, so without this the model stands on the X-Y plane instead of
 * lying on the X-Z ground grid. Assigned (not accumulated) because the glTF scene is cached and shared.
 */
const X_Z_Plane = -Math.PI / 2;

/** Reports download progress, sits the model on the grid centred at the origin, and frames it. */
export function useModelSetup(scene: THREE.Object3D) {
  const { model, viewer, project, measurements, calibration } = useStores();
  const { progress } = useProgress();

  useEffect(() => {
    model.setProgress(Math.round(progress));
  }, [progress, model]);

  useEffect(() => {
    if (project.pendingFrameMigration) {
      // Points saved before the orientation fix must move with the model, or they float off it.
      const remap = legacyPointRemap(scene, X_Z_Plane);
      measurements.remapPoints(remap);
      calibration.remapPoints(remap);
      project.finishFrameMigration();
    }
    scene.rotation.set(X_Z_Plane, 0, 0);
    makeMatte(scene);
    model.setLoaded(scene, placeOnGround(scene));
    viewer.requestFit();
    return () => disposeObject3D(scene);
  }, [scene, model, viewer, project, measurements, calibration]);
}
