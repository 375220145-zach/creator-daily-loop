import fs from 'node:fs';
import path from 'node:path';
import { VAULT_PATH, CRON_FILE } from '../config';
import type { LoopEntry, CronTask } from '../types';

const LOOP_REGISTRY = '02-Sources/loop-registry.md';

export function getLoops(): LoopEntry[] {
  const fullPath = path.join(VAULT_PATH, LOOP_REGISTRY);
  if (!fs.existsSync(fullPath)) return [];

  const raw = fs.readFileSync(fullPath, 'utf-8');
  const loops: LoopEntry[] = [];

  // Parse infrastructure loops table
  const infraMatch = raw.match(/## 基础设施循环[\s\S]*?\n(\|.*\|[\s\S]*?)(?=\n##|\n###|$)/);
  if (infraMatch) {
    loops.push(...parseLoopTable(infraMatch[1], 'infrastructure', null));
  }

  // Parse project loops
  const projectSection = raw.match(/## 项目循环([\s\S]*)/);
  if (projectSection) {
    // Find sub-sections with project names
    const subsections = projectSection[1].split(/(?=###\s)/);
    for (const sub of subsections) {
      const headingMatch = sub.match(/###\s+(.+)/);
      const projectName = headingMatch ? headingMatch[1].trim() : null;
      const tableMatch = sub.match(/\|.*\|[\s\S]*?(?=\n###|\n$|$)/);
      if (tableMatch) {
        loops.push(...parseLoopTable(tableMatch[0], 'project', projectName));
      }
    }
  }

  return loops;
}

function parseLoopTable(
  tableText: string,
  type: 'infrastructure' | 'project',
  project: string | null,
): LoopEntry[] {
  const rows = tableText
    .split('\n')
    .filter((line) => line.startsWith('|') && !line.includes('---'));
  const dataRows = rows.slice(1); // skip header

  return dataRows.map((row) => {
    const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
    return {
      id: cols[0] || 'unknown',
      name: cols[1] || '',
      frequency: cols[2] || '',
      description: cols[3] || '',
      type,
      project,
    };
  });
}

export function getCronTasks(): CronTask[] {
  if (!fs.existsSync(CRON_FILE)) return [];

  try {
    const raw = fs.readFileSync(CRON_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return (data.tasks || []) as CronTask[];
  } catch {
    return [];
  }
}

export function getActiveLoopCount(loops: LoopEntry[], cronTasks: CronTask[]): number {
  // Count unique loops: registry entries + durable cron tasks
  return loops.length + cronTasks.filter((t) => t.durable).length;
}
