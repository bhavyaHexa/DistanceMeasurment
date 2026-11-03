import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useStores } from '@/hooks/useStores';
import { projectPath } from '@/app/routes';

const REFRESH_INTERVAL_MS = 5000;

/** Loads the project list on mount and returns the action that creates a project and opens it. */
export function useProjectsPage() {
  const { projects, newProject, project } = useStores();
  const navigate = useNavigate();

  useEffect(() => {
    // Returning to the page: keep showing the cached rows and refresh them in the background.
    void projects.load(projects.hasLoaded ? undefined : 0, projects.hasLoaded);
    void project.checkHealth();
  }, [projects, project]);

  // Keep processing rows fresh, and refetch when the tab regains focus.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible' && !projects.isLoading) void projects.load(undefined, true);
    };
    const timer = setInterval(() => {
      if (projects.hasActiveRuns || project.uploadingRunIds.size > 0) refresh();
    }, REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [projects, project]);

  const createProject = async () => {
    const runId = await newProject.submit();
    if (runId) navigate(projectPath(runId));
  };

  return { createProject };
}
