import type { ReactNode } from 'react';

export function AppShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {header}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {children}
      </main>
    </div>
  );
}
