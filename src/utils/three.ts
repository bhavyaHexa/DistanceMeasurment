import * as THREE from 'three';
import type { Vec3 } from '@/types/geometry';

/**
 * Maps a point saved while `object` was left unrotated onto the same spot of the model once it is
 * rotated about X by `rotationX` and placed on the ground. Both placements are measured on a probe
 * copy, so `object` itself is not touched.
 */
export function legacyPointRemap(object: THREE.Object3D, rotationX: number): (point: Vec3) => Vec3 {
  const legacyOffset = placedOffset(object, 0);
  const currentOffset = placedOffset(object, rotationX);
  const xAxis = new THREE.Vector3(1, 0, 0);
  return (point) =>
    new THREE.Vector3(...point)
      .sub(legacyOffset)
      .applyAxisAngle(xAxis, rotationX)
      .add(currentOffset)
      .toArray() as Vec3;
}

/** Where `placeOnGround` would move `object` if it were rotated about X by `rotationX`. */
function placedOffset(object: THREE.Object3D, rotationX: number): THREE.Vector3 {
  const probe = object.clone();
  probe.position.set(0, 0, 0);
  probe.rotation.set(rotationX, 0, 0);
  placeOnGround(probe);
  return probe.position;
}

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
