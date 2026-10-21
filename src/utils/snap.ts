import * as THREE from 'three';

export type SnapKind = 'vertex' | 'edge' | 'surface';

export interface SnapResult {
  point: THREE.Vector3;
  kind: SnapKind;
}

/** How close (screen pixels) the cursor must be to a vertex/edge to snap to it. */
export const SNAP_RADIUS_PX = 10;
/**
 * Extra rays cast in a ring around the cursor. When the cursor is just past a silhouette edge
 * the centre ray hits a surface far behind; the ring rays still hit the near face, so its edge is found.
 */
const RING_SAMPLES = 8;
/** Candidates closer than this on screen count as tied; the one nearer the camera wins. */
const TIE_PX = 1.5;
/**
 * Only edges where the surface bends by more than this are snap targets. Flat faces are split into
 * triangles; their internal diagonals/vertices are not real features and must not attract points.
 */
const FEATURE_ANGLE_DEG = 20;

const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _projected = new THREE.Vector3();
const _instanceMatrix = new THREE.Matrix4();
const _local = new THREE.Vector3();

interface FeatureSet {
  edges: Set<string>;
  vertices: Set<string>;
}
const featureCache = new WeakMap<THREE.BufferGeometry, FeatureSet>();

interface Candidate {
  point: THREE.Vector3;
  /** Screen distance from the cursor, in pixels. */
  px: number;
  /** Distance from the camera, used to break ties. */
  depth: number;
}

/**
 * Find where a click at (clientX, clientY) should land on `root`: the nearest vertex within
 * SNAP_RADIUS_PX, else the nearest edge, else the surface under the cursor. Null if nothing is hit.
 */
export function findSnap(
  clientX: number,
  clientY: number,
  camera: THREE.Camera,
  canvas: HTMLElement,
  root: THREE.Object3D,
): SnapResult | null {
  const rect = canvas.getBoundingClientRect();
  const meshes: THREE.Object3D[] = [];
  root.traverseVisible((obj) => {
    if ((obj as THREE.Mesh).isMesh) meshes.push(obj);
  });

  const castAt = (x: number, y: number) => {
    _ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    _raycaster.setFromCamera(_ndc, camera);
    return _raycaster.intersectObjects(meshes, false)[0];
  };

  const centerHit = castAt(clientX, clientY);
  const cursorRay = _raycaster.ray.clone();

  const hits = centerHit ? [centerHit] : [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const angle = (i / RING_SAMPLES) * Math.PI * 2;
    const hit = castAt(
      clientX + Math.cos(angle) * SNAP_RADIUS_PX,
      clientY + Math.sin(angle) * SNAP_RADIUS_PX,
    );
    if (hit) hits.push(hit);
  }

  const toCandidate = (point: THREE.Vector3): Candidate | null => {
    _projected.copy(point).project(camera);
    if (_projected.z < -1 || _projected.z > 1) return null; // behind camera / outside frustum depth
    const sx = ((_projected.x + 1) / 2) * rect.width + rect.left;
    const sy = ((1 - _projected.y) / 2) * rect.height + rect.top;
    const px = Math.hypot(sx - clientX, sy - clientY);
    if (px > SNAP_RADIUS_PX) return null;
    return { point, px, depth: cursorRay.origin.distanceTo(point) };
  };

  const vertices: Candidate[] = [];
  const edges: Candidate[] = [];
  const seenFaces = new Set<string>();

  for (const hit of hits) {
    if (!hit.face) continue;
    const key = `${hit.object.uuid}/${hit.faceIndex}/${hit.instanceId ?? ''}`;
    if (seenFaces.has(key)) continue;
    seenFaces.add(key);

    const tri = triangleInWorld(hit);
    const isFeature = featureFilter(hit);
    for (let i = 0; i < 3; i++) {
      if (!isFeature.vertex(i)) continue;
      const c = toCandidate(tri[i]);
      if (c) vertices.push(c);
    }
    for (let i = 0; i < 3; i++) {
      if (!isFeature.edge(i, (i + 1) % 3)) continue;
      // Point on the edge closest to the cursor ray (exact under perspective, unlike a 2D projection).
      const onEdge = new THREE.Vector3();
      cursorRay.distanceSqToSegment(tri[i], tri[(i + 1) % 3], undefined, onEdge);
      const c = toCandidate(onEdge);
      if (c) edges.push(c);
    }
  }

  const vertex = pickBest(vertices);
  if (vertex) return { point: vertex.point, kind: 'vertex' };
  const edge = pickBest(edges);
  if (edge) return { point: edge.point, kind: 'edge' };
  if (centerHit) return { point: centerHit.point.clone(), kind: 'surface' };
  return null;
}

function pickBest(candidates: Candidate[]): Candidate | null {
  let best: Candidate | null = null;
  for (const c of candidates) {
    if (
      !best ||
      c.px < best.px - TIE_PX ||
      (Math.abs(c.px - best.px) <= TIE_PX && c.depth < best.depth)
    ) {
      best = c;
    }
  }
  return best;
}

/** Which corners/edges of the hit triangle (by corner 0..2) are real geometric features. */
function featureFilter(hit: THREE.Intersection) {
  const mesh = hit.object as THREE.Mesh;
  const deformed =
    (mesh as THREE.SkinnedMesh).isSkinnedMesh ||
    (mesh.morphTargetInfluences?.some((w) => w !== 0) ?? false);
  // Feature edges are computed from the rest pose, so they don't apply to deformed meshes.
  if (deformed) return { vertex: () => true, edge: () => true };

  const features = featuresOf(mesh.geometry);
  const position = mesh.geometry.getAttribute('position');
  const { a, b, c } = hit.face!;
  const keys = [a, b, c].map((index) => pointKey(_local.fromBufferAttribute(position, index)));
  return {
    vertex: (i: number) => features.vertices.has(keys[i]),
    edge: (i: number, j: number) => features.edges.has(edgeKey(keys[i], keys[j])),
  };
}

function featuresOf(geometry: THREE.BufferGeometry): FeatureSet {
  let features = featureCache.get(geometry);
  if (!features) {
    const edgesGeometry = new THREE.EdgesGeometry(geometry, FEATURE_ANGLE_DEG);
    const pos = edgesGeometry.getAttribute('position');
    features = { edges: new Set(), vertices: new Set() };
    for (let i = 0; i < pos.count; i += 2) {
      const ka = pointKey(_local.fromBufferAttribute(pos, i));
      const kb = pointKey(_local.fromBufferAttribute(pos, i + 1));
      features.edges.add(edgeKey(ka, kb));
      features.vertices.add(ka);
      features.vertices.add(kb);
    }
    edgesGeometry.dispose();
    featureCache.set(geometry, features);
  }
  return features;
}

const pointKey = (v: THREE.Vector3) => `${v.x.toFixed(5)},${v.y.toFixed(5)},${v.z.toFixed(5)}`;
const edgeKey = (ka: string, kb: string) => (ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`);

/** World-space corners of the intersected triangle (handles skinning, morphs and instancing). */
function triangleInWorld(hit: THREE.Intersection): THREE.Vector3[] {
  const mesh = hit.object as THREE.Mesh;
  const { a, b, c } = hit.face!;
  return [a, b, c].map((index) => {
    const v = mesh.getVertexPosition(index, new THREE.Vector3());
    const instanced = mesh as THREE.InstancedMesh;
    if (instanced.isInstancedMesh && hit.instanceId != null) {
      instanced.getMatrixAt(hit.instanceId, _instanceMatrix);
      v.applyMatrix4(_instanceMatrix);
    }
    return v.applyMatrix4(mesh.matrixWorld);
  });
}
