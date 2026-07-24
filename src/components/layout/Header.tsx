import { useState } from 'react';

export function Header({ onRefresh }: { onRefresh: () => void }) {
  const [lastRefresh, setLastRefresh] = useState('');
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    onRefresh();
    setLastRefresh(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔁</span>
        <h1 className="text-lg font-semibold text-gray-100">Loop 知识库</h1>
        <span className="text-xs text-gray-600 bg-gray-900 px-2 py-0.5 rounded">
          Agent Loop System
        </span>
      </div>
      <div className="flex items-center gap-3">
        {lastRefresh && (
          <span className="text-xs text-gray-600">最后刷新: {lastRefresh}</span>
        )}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-gray-200 transition-colors"
        >
          <span className={spinning ? 'animate-spin' : ''}>⟳</span>
          刷新
        </button>
      </div>
    </header>
  );
}
