import { observer } from 'mobx-react-lite';
import { Plus, Search } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { useStores } from '@/hooks/useStores';
import { useProjectsPage } from './hooks/useProjectsPage';
import { NewProjectDialog } from './NewProjectDialog';
import { ProjectsTable } from './ProjectsTable';

export const ProjectsPage = observer(function ProjectsPage() {
  const { projects, newProject } = useStores();
  const { createProject } = useProjectsPage();

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-4 sm:px-6">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-gray-600">Open a saved project or check on a video that is still processing.</p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <label className="relative flex-1 sm:w-64 sm:flex-none">
              <span className="sr-only">Search projects</span>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                value={projects.search}
                onChange={(event) => projects.setSearch(event.target.value)}
                placeholder="Search projects"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pr-3 pl-9 text-sm shadow-xs outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <Button variant="primary" size="lg" icon={Plus} onClick={newProject.open}>
              New project
            </Button>
          </div>
        </div>

        <ProjectsTable />
      </main>

      <NewProjectDialog onSubmit={createProject} />
    </div>
  );
});
