import * as THREE from 'three';
import type { Vec3 } from '@/types/geometry';
import { findSnap } from './snap';

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

/**
 * The model point under screen position (clientX, clientY): snapped to a nearby vertex or
 * edge when `snap` is on, otherwise the nearest surface hit. Null when the model isn't hit.
 */
export function pickModelPoint(
  clientX: number,
  clientY: number,
  camera: THREE.Camera,
  canvas: HTMLElement,
  model: THREE.Object3D,
  snap: boolean,
): Vec3 | null {
  if (snap) return findSnap(clientX, clientY, camera, canvas, model)?.point.toArray() ?? null;

  const rect = canvas.getBoundingClientRect();
  ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  return raycaster.intersectObject(model, true)[0]?.point.toArray() ?? null;
}
