import type { ReactNode } from 'react';

/** A centred card for empty, error and "nothing found" states. */
export function StateCard({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-gray-600">{text}</p>
      {children}
    </div>
  );
}
