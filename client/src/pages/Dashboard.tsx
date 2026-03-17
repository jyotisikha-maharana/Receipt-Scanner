import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';

export function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" subtitle="Your expense overview" />
      <Card>
        <p className="text-sm text-gray-500">Dashboard charts coming in Phase 4.</p>
      </Card>
    </div>
  );
}
