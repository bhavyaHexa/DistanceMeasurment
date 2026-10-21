import { Outlet } from 'react-router';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function AppLayout() {
  return (
    <>
      <Outlet />
      <ConfirmDialog />
    </>
  );
}
