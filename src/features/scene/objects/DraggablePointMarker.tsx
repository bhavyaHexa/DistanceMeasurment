import { Html } from '@react-three/drei';
import type { Vec3 } from '@/types/geometry';
import type { DragTarget } from '@/types/workspace';
import { cn } from '@/utils/cn';
import { usePointDrag } from '../hooks/usePointDrag';

interface DraggablePointMarkerProps {
  target: DragTarget;
  position: Vec3;
  color: string;
  /** Letter shown inside the marker (calibration points A/B). */
  label?: string;
}

export function DraggablePointMarker({ target, position, color, label }: DraggablePointMarkerProps) {
  const onPointerDown = usePointDrag(target, position);

  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <span
        role="presentation"
        draggable={false}
        onPointerDown={onPointerDown}
        onDragStart={(event) => event.preventDefault()}
        className={cn(
          'flex cursor-grab items-center justify-center rounded-full border-[3px] border-white text-[11px] font-semibold text-white shadow-md',
          'transition-transform select-none hover:scale-125 active:cursor-grabbing',
          label ? 'size-6' : 'size-4',
        )}
        style={{ background: color }}
      >
        {label}
      </span>
    </Html>
  );
}
