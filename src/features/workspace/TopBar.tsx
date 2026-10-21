import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { LogoMark } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useStores } from '@/hooks/useStores';
import { UNITS } from '@/utils/units';
import { PROJECTS_PATH } from '@/app/routes';
import { SaveStatus } from './SaveStatus';
import { StepIndicator } from './StepIndicator';
import { STEPS } from './steps';

export const TopBar = observer(function TopBar() {
  const { project, workspace } = useStores();

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-gray-200 bg-white px-4 py-2.5 sm:px-5">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2.5 text-sm">
        <Link to={PROJECTS_PATH} aria-label="All projects">
          <LogoMark />
        </Link>
        <Link to={PROJECTS_PATH} className="hidden font-medium text-gray-600 hover:text-gray-900 sm:inline">
          Projects
        </Link>
        <ChevronRight aria-hidden className="hidden size-3.5 text-gray-400 sm:block" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-gray-900">{project.name || 'Loading…'}</span>
          <span className="text-xs text-gray-600 md:hidden">
            Step {workspace.stepNumber} of {STEPS.length} · {STEPS[workspace.stepNumber - 1].label}
          </span>
        </div>
      </nav>

      <StepIndicator className="hidden md:flex" />

      <div className="flex items-center gap-3">
        <SaveStatus className="hidden sm:flex" />
        {workspace.step !== 'upload' && (
          <Select
            label="Units"
            hideLabel
            value={workspace.displayUnit}
            options={UNITS}
            onChange={workspace.setDisplayUnit}
          />
        )}
        <Button
          size="sm"
          variant={project.hasUnsavedChanges ? 'primary' : 'secondary'}
          loading={project.isSaving}
          disabled={!project.canSave}
          onClick={project.save}
        >
          Save
        </Button>
      </div>
    </header>
  );
});
