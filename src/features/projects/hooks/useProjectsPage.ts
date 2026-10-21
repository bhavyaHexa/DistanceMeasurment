import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useStores } from '@/hooks/useStores';
import { projectPath } from '@/app/routes';

/** Loads the project list on mount and returns the action that creates a project and opens it. */
export function useProjectsPage() {
  const { projects, newProject } = useStores();
  const navigate = useNavigate();

  useEffect(() => {
    void projects.load(0);
  }, [projects]);

  const createProject = async () => {
    const runId = await newProject.submit();
    if (runId) navigate(projectPath(runId));
  };

  return { createProject };
}
