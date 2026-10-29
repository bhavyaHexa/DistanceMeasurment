import { observer } from 'mobx-react-lite';
import { Box, FolderOpen, Plus, RotateCw } from 'lucide-react';
import { Link } from 'react-router';
import { StateCard } from '@/components/StateCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Spinner } from '@/components/ui/Spinner';
import { useStores } from '@/hooks/useStores';
import { capitalize, formatDateTime } from '@/utils/format';
import { projectPath } from '@/app/routes';
import { STATUS_TONE } from './projectStatus';

const COLUMN = 'px-5 py-3 text-left text-xs font-medium text-gray-600';
const CELL = 'px-5 py-3.5 text-sm whitespace-nowrap text-gray-700';

export const ProjectsTable = observer(function ProjectsTable() {
  const { projects, newProject } = useStores();

  if (projects.error) {
    return (
      <StateCard title="Couldn't load projects" text={projects.error}>
        <Button icon={RotateCw} onClick={() => projects.load()}>
          Try again
        </Button>
      </StateCard>
    );
  }

  if (projects.isEmpty) {
    return projects.search.trim() ? (
      <StateCard title="No matching projects" text={`Nothing matches “${projects.search.trim()}”.`} />
    ) : (
      <StateCard title="No projects yet" text="Create a project and upload a video to start measuring.">
        <Button variant="primary" icon={Plus} onClick={newProject.open}>
          New project
        </Button>
      </StateCard>
    );
  }

  if (!projects.hasLoaded) {
    return (
      <div className="flex justify-center rounded-xl border border-gray-200 bg-white py-16">
        <Spinner label="Loading projects" className="text-gray-500" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className={COLUMN}>Name</th>
              <th className={COLUMN}>Status</th>
              <th className={COLUMN}>Last saved</th>
              <th className={COLUMN}>Created</th>
              <th className={COLUMN}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className={projects.isLoading ? 'opacity-60' : undefined}>
            {projects.items.map((run) => (
              <tr key={run.run_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className={`${CELL} font-medium text-gray-900`}>
                  <Link to={projectPath(run.run_id)} className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-gray-100">
                      <Box aria-hidden className="size-4 text-gray-600" />
                    </span>
                    {run.project_name}
                  </Link>
                </td>
                <td className={CELL}>
                  <Badge tone={STATUS_TONE[run.status] ?? 'gray'}>{capitalize(run.status)}</Badge>
                </td>
                <td className={CELL}>{formatDateTime(run.saved_at)}</td>
                <td className={`${CELL} text-gray-600`}>{formatDateTime(run.created_at)}</td>
                <td className={`${CELL} text-right`}>
                  <Link to={projectPath(run.run_id)} className={buttonClasses('secondary', 'sm')}>
                    <FolderOpen aria-hidden className="size-4" />
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-3 text-sm text-gray-600">
        <span>
          Page {projects.page + 1} of {projects.pageCount}
        </span>
        <div className="flex gap-2">
          <Button size="sm" disabled={!projects.canGoBack} onClick={projects.previousPage}>
            Previous
          </Button>
          <Button size="sm" disabled={!projects.canGoForward} onClick={projects.nextPage}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
});
