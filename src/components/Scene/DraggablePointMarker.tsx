import { useRef, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { findSnap } from '../../utils/snap';
import type { Vec3 } from '../../types/measurement';
import './Markers.css';

interface Props {
  id: string;
  end: 'a' | 'b';
  position: Vec3 | THREE.Vector3;
  color?: string;
  isCal?: boolean;
}

const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export const DraggablePointMarker = observer(function DraggablePointMarker({
  id,
  end,
  position,
  color,
  isCal
}: Props) {
  const { model, measurement, ui } = useStores();
  const { camera, gl } = useThree();
  const isDragging = useRef(false);

  const toNDC = useCallback(
    (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      _mouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    },
    [gl],
  );

  useEffect(() => {
    return () => {
      if (isDragging.current) measurement.setDragging(null);
    };
  }, [measurement]);

  const onPointerDown = useCallback(
    (e: any) => {
      e.stopPropagation();
      isDragging.current = true;
      measurement.setDragging(id);
      
      const onMove = (ev: PointerEvent) => {
        if (!isDragging.current) return;
        const modelScene = model.scene;
        if (!modelScene) return;

        toNDC(ev);
        _raycaster.setFromCamera(_mouse, camera);

        const targets: THREE.Mesh[] = [];
        modelScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) targets.push(child as THREE.Mesh);
        });

        const hits = _raycaster.intersectObjects(targets, false);
        if (hits.length > 0) {
          const hit = hits[0];
          let point: Vec3 = [hit.point.x, hit.point.y, hit.point.z];
          if (ui.snapToEdges) {
            const snap = findSnap(ev.clientX, ev.clientY, camera, gl.domElement, modelScene);
            if (snap) point = snap.point.toArray();
          }
          measurement.movePoint(id, end, point);
        }
      };

      const onUp = () => {
        isDragging.current = false;
        measurement.setDragging(null);
        gl.domElement.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      gl.domElement.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      // A cancelled pointer (touch interrupted, browser gesture) never fires pointerup —
      // without this the drag stays active and OrbitControls stay disabled.
      window.addEventListener('pointercancel', onUp);
    },
    [camera, gl, measurement, id, model, toNDC, end, ui.snapToEdges]
  );

  const posArray = Array.isArray(position) ? position : [position.x, position.y, position.z];

  let classes = 'point-marker draggable';
  if (isDragging.current) classes += ' dragging';

  return (
    <Html position={posArray as [number, number, number]} center zIndexRange={[100, 0]}>
      <div
        className={classes}
        onPointerDown={onPointerDown}
        onDragStart={(e) => e.preventDefault()}
        draggable={false}
        style={{
          '--marker-color': color || 'var(--primary-strong)',
        } as React.CSSProperties}
      >
        {isCal && <span className="cal-letter">{end.toUpperCase()}</span>}
      </div>
    </Html>
  );
});
