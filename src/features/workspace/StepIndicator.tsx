import { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { Check } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/utils/cn';
import { STEPS } from './steps';

export const StepIndicator = observer(function StepIndicator({ className }: { className?: string }) {
  const { workspace } = useStores();

  return (
    <ol aria-label="Progress" className={cn('items-center gap-2 text-[13px]', className)}>
      {STEPS.map(({ id, label }, index) => {
        const isCurrent = workspace.step === id;
        const isDone = !isCurrent && workspace.isStepDone(id);
        const canOpen = !isCurrent && workspace.canOpenStep(id);

        return (
          <Fragment key={id}>
            {index > 0 && (
              <li aria-hidden className={cn('h-px w-8', isDone || isCurrent ? 'bg-gray-400' : 'bg-gray-300')} />
            )}
            <li aria-current={isCurrent ? 'step' : undefined}>
              <button
                type="button"
                disabled={!canOpen}
                onClick={() => workspace.openStep(id)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-1.5 py-1 font-medium',
                  isCurrent ? 'font-semibold text-gray-900' : isDone ? 'text-gray-700' : 'text-gray-500',
                  canOpen ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'flex size-[22px] items-center justify-center rounded-full text-xs',
                    isCurrent && 'bg-blue-600 text-white',
                    isDone && 'bg-green-50',
                    !isCurrent && !isDone && 'border border-gray-300',
                  )}
                >
                  {isDone ? <Check aria-hidden strokeWidth={3} className="size-3 text-green-700" /> : index + 1}
                </span>
                {label}
              </button>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
});
