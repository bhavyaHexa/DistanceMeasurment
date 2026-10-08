import * as THREE from 'three';
import type { Intersection, Camera } from 'three';

export function snapToVertex(
  hit: Intersection,
  camera: Camera,
  size: { width: number; height: number },
  maxPx = 15
): { point: [number, number, number]; snapped: boolean } {
  const mesh = hit.object as THREE.Mesh;
  const geometry = mesh.geometry as THREE.BufferGeometry;
  if (!geometry || !geometry.attributes.position || hit.faceIndex === undefined) {
    return { point: [hit.point.x, hit.point.y, hit.point.z], snapped: false };
  }

  const positions = geometry.attributes.position;
  const i3 = hit.faceIndex * 3;
  
  // Get the 3 vertices of the hit face
  const indices = geometry.index 
    ? [geometry.index.getX(i3), geometry.index.getX(i3+1), geometry.index.getX(i3+2)]
    : [i3, i3+1, i3+2];

  const vA = new THREE.Vector3().fromBufferAttribute(positions, indices[0]);
  const vB = new THREE.Vector3().fromBufferAttribute(positions, indices[1]);
  const vC = new THREE.Vector3().fromBufferAttribute(positions, indices[2]);

  // Apply world transform
  vA.applyMatrix4(mesh.matrixWorld);
  vB.applyMatrix4(mesh.matrixWorld);
  vC.applyMatrix4(mesh.matrixWorld);

  const vertices = [vA, vB, vC];

  // Screen coordinates of the mouse
  const mouseScreen = hit.point.clone().project(camera);
  const mousePxX = (mouseScreen.x * 0.5 + 0.5) * size.width;
  const mousePxY = (-(mouseScreen.y) * 0.5 + 0.5) * size.height;

  let nearestVertex: THREE.Vector3 | null = null;
  let minDistance = maxPx;

  for (const v of vertices) {
    const projected = v.clone().project(camera);
    const pxX = (projected.x * 0.5 + 0.5) * size.width;
    const pxY = (-(projected.y) * 0.5 + 0.5) * size.height;
    
    const dx = pxX - mousePxX;
    const dy = pxY - mousePxY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDistance) {
      minDistance = dist;
      nearestVertex = v;
    }
  }

  if (nearestVertex) {
    return { point: [nearestVertex.x, nearestVertex.y, nearestVertex.z], snapped: true };
  }

  return { point: [hit.point.x, hit.point.y, hit.point.z], snapped: false };
}
