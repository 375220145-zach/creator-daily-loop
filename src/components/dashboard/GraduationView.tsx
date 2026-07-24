import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import type { GraduationEntry } from '../../types';

export function GraduationView() {
  const { data, loading } = useApi<GraduationEntry[]>('/api/graduation');
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  const toggleExpand = (target: string) => {
    setExpandedTarget(expandedTarget === target ? null : target);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-32 mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-800 rounded mb-2" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">Graduation Queue</h2>
        </div>
        <div className="p-8 text-center text-gray-600 text-sm">暂无候审条目</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">Graduation Queue</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="px-5 py-3 font-medium">范围</th>
              <th className="px-5 py-3 font-medium">次数</th>
              <th className="px-5 py-3 font-medium">模式</th>
              <th className="px-5 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <>
                <tr
                  key={entry.target}
                  onClick={() => toggleExpand(entry.target)}
                  className="border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {entry.scope.map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-gray-300 font-mono">{entry.count}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 max-w-xs truncate" title={entry.target}>
                    {entry.target.replace(/^_principles\//, '').replace(/\.md$/, '')}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        entry.status.includes('approved')
                          ? 'bg-green-950/50 text-green-400'
                          : entry.status.includes('watching')
                            ? 'bg-amber-950/50 text-amber-400'
                            : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
                {expandedTarget === entry.target && (
                  <tr key={`${entry.target}-detail`}>
                    <td colSpan={4} className="px-5 py-3 bg-gray-950/50">
                      {entry.details ? (
                        <div className="text-xs text-gray-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {entry.details}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600">暂无详情</div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
