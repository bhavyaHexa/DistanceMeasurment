import { createBrowserRouter, Navigate } from 'react-router';
import { ProjectsPage } from '@/features/projects/ProjectsPage';
import { AppLayout } from './AppLayout';
import { PROJECTS_PATH } from './routes';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: PROJECTS_PATH, element: <ProjectsPage /> },
      {
        // The workspace pulls in three.js; load it only when a project is opened.
        path: `${PROJECTS_PATH}/:runId`,
        lazy: async () => ({ Component: (await import('@/features/workspace/WorkspacePage')).WorkspacePage }),
      },
      { path: '*', element: <Navigate to={PROJECTS_PATH} replace /> },
    ],
  },
]);
