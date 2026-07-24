import { useCallback, useState } from 'react';
import { useApi } from './hooks/useApi';
import { AppShell } from './components/layout/AppShell';
import { Header } from './components/layout/Header';
import { OverviewStats } from './components/dashboard/OverviewStats';
import { ProblemBoard } from './components/dashboard/ProblemBoard';
import { LoopActivity } from './components/dashboard/LoopActivity';
import { GraduationView } from './components/dashboard/GraduationView';
import type { Overview } from './types';

export function App() {
  const { data: overview, loading, refresh } = useApi<Overview>('/api/overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    refresh();
    setRefreshKey((k) => k + 1);
  }, [refresh]);

  return (
    <AppShell header={<Header onRefresh={handleRefresh} />}>
      <div key={refreshKey}>
        <OverviewStats data={overview} loading={loading} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <LoopActivity />
          <GraduationView />
        </div>
        <div className="mt-6">
          <ProblemBoard />
        </div>
      </div>
    </AppShell>
  );
}
