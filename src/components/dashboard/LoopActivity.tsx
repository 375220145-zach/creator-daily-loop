import { useApi } from '../../hooks/useApi';
import type { LoopEntry, CronTask } from '../../types';

export function LoopActivity() {
  const { data, loading } = useApi<{ loops: LoopEntry[]; cronTasks: CronTask[] }>('/api/loops');

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-24 mb-4" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { loops, cronTasks } = data;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">活跃循环</h2>
      </div>
      <div className="p-5 space-y-3">
        {loops.length === 0 && cronTasks.length === 0 && (
          <div className="text-sm text-gray-600 text-center py-4">暂无活跃循环</div>
        )}

        {loops.map((loop) => (
          <div
            key={loop.id}
            className="flex items-start gap-3 p-3 bg-gray-950 rounded-lg border border-gray-800/50"
          >
            <span
              className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                loop.type === 'infrastructure' ? 'bg-indigo-400' : 'bg-amber-400'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500">{loop.id.slice(0, 8)}</span>
                <span className="text-sm font-medium text-gray-200 truncate">{loop.name}</span>
                <span className="text-xs text-gray-600">{loop.frequency}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{loop.description}</p>
              {loop.project && (
                <span className="inline-block mt-1 text-xs text-amber-400/70 bg-amber-400/5 px-1.5 py-0.5 rounded">
                  {loop.project}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Durable cron tasks */}
        {cronTasks
          .filter((t) => t.durable)
          .map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 bg-gray-950 rounded-lg border border-gray-800/50"
            >
              <span className="mt-0.5 w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">
                    {task.id.slice(0, 8)}
                  </span>
                  <span className="text-sm text-gray-300 truncate">Cron 持久任务</span>
                  <span className="text-xs text-gray-600">{task.cron}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{task.prompt.slice(0, 80)}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
