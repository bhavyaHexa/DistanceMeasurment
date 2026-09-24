import { createContext, useContext } from 'react';
import type * as THREE from 'three';

/** Holds a reference to the loaded GLTF scene object for raycasting during drag. */
export const ModelMeshContext = createContext<THREE.Object3D | null>(null);

export function useModelMesh(): THREE.Object3D | null {
  return useContext(ModelMeshContext);
}
