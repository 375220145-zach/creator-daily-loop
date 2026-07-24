import type { FeedbackStatus } from '../../types';

const STATUS_STYLES: Record<FeedbackStatus, { bg: string; text: string; label: string }> = {
  recent: { bg: 'bg-amber-950/50', text: 'text-amber-400', label: '近期' },
  recorded: { bg: 'bg-gray-800', text: 'text-gray-500', label: '已记录' },
  'auto-fixed': { bg: 'bg-green-950/50', text: 'text-green-400', label: '已自动修复' },
  observation: { bg: 'bg-blue-950/50', text: 'text-blue-400', label: '观察中' },
};

export function StatusBadge({ status }: { status: FeedbackStatus }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.recorded;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
