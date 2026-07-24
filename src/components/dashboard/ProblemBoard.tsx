import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { StatusBadge } from '../shared/StatusBadge';
import { MarkdownView } from '../shared/MarkdownView';
import type { FeedbackItem, FeedbackDetail, FeedbackStatus, ProjectSummary } from '../../types';
import { formatDate } from '../../lib/format';

export function ProblemBoard() {
  const { data: feedbacks, loading, refresh: refreshList } = useApi<FeedbackItem[]>('/api/feedback');
  const { data: projects } = useApi<ProjectSummary[]>('/api/projects');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<FeedbackDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const expandRow = async (item: FeedbackItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      setDetailData(null);
      return;
    }
    setExpandedId(item.id);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/feedback/${item.project}/${item.id}.md`);
      if (res.ok) {
        setDetailData(await res.json());
      }
    } catch {
      // ignore
    }
    setDetailLoading(false);
  };

  // Build filtered list
  const filtered = feedbacks
    ? feedbacks.filter((f) => {
        if (filterProject && f.project !== filterProject) return false;
        if (filterStatus && f.inferredStatus !== filterStatus) return false;
        return true;
      })
    : [];

  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: '全部状态' },
    { value: 'recent', label: '近期' },
    { value: 'recorded', label: '已记录' },
    { value: 'auto-fixed', label: '已自动修复' },
    { value: 'observation', label: '观察中' },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header + Filters */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-gray-200">问题看板</h2>
        <div className="flex items-center gap-2">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300"
          >
            <option value="">全部项目</option>
            {projects?.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} ({p.openCount})
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-600 text-sm">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-600 text-sm">暂无匹配的反馈记录</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                <th className="px-5 py-3 font-medium">日期</th>
                <th className="px-5 py-3 font-medium">项目</th>
                <th className="px-5 py-3 font-medium">标题</th>
                <th className="px-5 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <>
                  <tr
                    key={item.id}
                    onClick={() => expandRow(item)}
                    className={`border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                      expandedId === item.id ? 'bg-gray-800/70' : ''
                    }`}
                  >
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-5 py-3 text-gray-300 font-medium">{item.project}</td>
                    <td className="px-5 py-3 text-gray-400 max-w-md truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.inferredStatus} />
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr key={`${item.id}-detail`}>
                      <td colSpan={4} className="px-5 py-4 bg-gray-950/50">
                        {detailLoading ? (
                          <div className="text-sm text-gray-600">加载详情...</div>
                        ) : detailData ? (
                          <div className="max-h-96 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs text-gray-600">
                                状态: <StatusBadge status={item.inferredStatus} />
                                {' — 7 天内为「近期」，超过 7 天为「已记录」'}
                              </span>
                            </div>
                            <MarkdownView body={detailData.body} />
                          </div>
                        ) : (
                          <div className="text-sm text-red-400">加载失败</div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
