import { StatCard } from '../shared/StatCard';
import type { Overview } from '../../types';

export function OverviewStats({
  data,
  loading,
}: {
  data: Overview | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-16 mb-3" />
            <div className="h-8 bg-gray-800 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="反馈总计"
        value={data.totalFeedback}
        sub={`${data.recentFeedback} 条近期 · ${data.recordedFeedback} 条已记录`}
      />
      <StatCard
        label="活跃循环"
        value={data.activeLoops}
        sub={`${data.autoFixedFeedback} 条自动修复 · ${data.observationFeedback} 条观察`}
      />
      <StatCard
        label="待审模式"
        value={data.pendingGraduationItems}
        sub="Graduation Queue 候审"
      />
      <StatCard
        label="涉及项目"
        value={`${data.projectsWithFeedback} / ${data.totalProjects}`}
        sub={`${data.recordedFeedback} 条已记录`}
      />
    </div>
  );
}
