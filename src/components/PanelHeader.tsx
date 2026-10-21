import type { ReactNode } from 'react';

export function PanelHeader({ title, description, action }: { title: ReactNode; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-2 text-base font-semibold">{title}</h2>
        {description && <p className="text-[13px] leading-relaxed text-gray-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}
