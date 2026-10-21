import { Ruler } from 'lucide-react';

export function LogoMark() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-blue-600">
      <Ruler aria-hidden className="size-4 text-white" />
    </span>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[15px] font-semibold text-gray-900">Distance Measure</span>
    </span>
  );
}
