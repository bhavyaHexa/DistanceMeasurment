import { Html } from '@react-three/drei';
import type { Vec3 } from '@/types/geometry';
import { cn } from '@/utils/cn';

interface ValueLabelProps {
  position: Vec3;
  color: string;
  text: string;
  emphasized?: boolean;
}

export function ValueLabel({ position, color, text, emphasized = false }: ValueLabelProps) {
  return (
    <Html position={position} center pointerEvents="none" zIndexRange={[80, 0]}>
      <span
        className={cn(
          'block rounded-md px-2 py-1 text-[13px] font-semibold whitespace-nowrap text-white tabular-nums shadow',
          emphasized && 'px-2.5 py-1.5 text-sm ring-2 ring-white',
        )}
        style={{ background: color }}
      >
        {text}
      </span>
    </Html>
  );
}
