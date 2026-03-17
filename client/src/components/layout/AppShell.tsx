import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
