import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';

export function SettingsPage() {
  return (
    <div>
      <Header title="Settings" subtitle="Manage budgets and preferences" />
      <Card>
        <p className="text-sm text-gray-500">Budget management coming in Phase 5.</p>
      </Card>
    </div>
  );
}
