import type * as THREE from 'three';

export type ModelFormat = 'glb' | 'obj' | 'stl';

/**
 * Converts the loaded model to OBJ (geometry only, no materials) or binary STL in raw model units.
 * Vertices are baked with each mesh's world matrix, so the file is Y-up and sits on the ground
 * exactly as shown in the viewer. Exporters are loaded on demand to keep them out of the main bundle.
 */
export async function exportModel(scene: THREE.Object3D, format: Exclude<ModelFormat, 'glb'>): Promise<Blob> {
  scene.updateMatrixWorld(true);

  if (format === 'obj') {
    const { OBJExporter } = await import('three/examples/jsm/exporters/OBJExporter.js');
    return new Blob([new OBJExporter().parse(scene)], { type: 'model/obj' });
  }

  const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter.js');
  const data = new STLExporter().parse(scene, { binary: true });
  return new Blob([data], { type: 'model/stl' });
}
