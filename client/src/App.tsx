import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/Dashboard';
import { ExpensesPage } from './pages/Expenses';
import { UploadPage } from './pages/Upload';
import { SettingsPage } from './pages/Settings';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
