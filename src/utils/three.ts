import * as THREE from 'three';

/**
 * Moves `object` so it's centred on the origin in X/Z and rests on the ground plane.
 * Returns the radius of its bounding sphere.
 */
export function placeOnGround(object: THREE.Object3D): number {
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= bounds.min.y;
  return bounds.getBoundingSphere(new THREE.Sphere()).radius;
}

/**
 * Makes every material on `root` matte. Converted scans often come out fully metallic (the glTF
 * default), which renders near-black without an environment map to reflect.
 */
export function makeMatte(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      material.metalness = 0;
      material.roughness = 1;
      material.needsUpdate = true;
    }
  });
}

/** Frees the GPU resources (geometry, materials, textures) held by `root` and its children. */
export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    }
  });
}
