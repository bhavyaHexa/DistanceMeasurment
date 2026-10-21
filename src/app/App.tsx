import { RouterProvider } from 'react-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StoreProvider } from '@/stores/StoreProvider';
import { router } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </ErrorBoundary>
  );
}
