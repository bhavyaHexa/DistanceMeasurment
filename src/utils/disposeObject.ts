import * as THREE from 'three';

export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        if (!mat) return;
        Object.values(mat).forEach((value) => {
          if (value && typeof value === 'object' && 'isTexture' in value) {
            (value as THREE.Texture).dispose();
          }
        });
        mat.dispose();
      });
    }
  });
}
