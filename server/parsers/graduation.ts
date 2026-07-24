import fs from 'node:fs';
import path from 'node:path';
import { VAULT_PATH } from '../config';
import type { GraduationEntry } from '../types';

const GRADUATION_FILE = '04-Feedback/graduation-queue.md';

export function getGraduationQueue(): GraduationEntry[] {
  const fullPath = path.join(VAULT_PATH, GRADUATION_FILE);
  if (!fs.existsSync(fullPath)) return [];

  const raw = fs.readFileSync(fullPath, 'utf-8');

  // Find the table section between "## 候审条目" and "## 条目详情"
  const tableMatch = raw.match(/## 候审条目\n\n(\|.*\|[\s\S]*?)(?=\n## |$)/);
  if (!tableMatch) return [];

  const tableText = tableMatch[1];
  const rows = tableText.split('\n').filter((line) => line.startsWith('|') && !line.includes('---'));

  // Skip header row (first row with column names)
  const dataRows = rows.slice(1);
  const entries: GraduationEntry[] = [];

  for (const row of dataRows) {
    const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
    if (cols.length < 5) continue;

    const status = cols[0];
    const scopeRaw = cols[1];
    const count = parseInt(cols[2], 10) || 0;
    const evidence = cols[3];
    const target = cols[4];

    // Parse scope: can be comma-separated project names
    const scope = scopeRaw
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Find detail section for this entry
    const detailTarget = target.replace(/^_principles\//, '').replace(/\.md$/, '');
    const detailSection = extractDetailSection(raw, detailTarget);

    entries.push({
      status,
      scope,
      count,
      evidence,
      target,
      details: detailSection,
    });
  }

  return entries;
}

function extractDetailSection(raw: string, targetSlug: string): string {
  // Look for "### <targetSlug>" heading and extract content until next "###" or end
  const escaped = targetSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`### ${escaped}\\b([\\s\\S]*?)(?=\n### |\n---\n|\n$|$)`, 'i');
  const match = raw.match(regex);
  return match ? match[1].trim() : '';
}

/** Count pending (watching) items */
export function getPendingCount(entries: GraduationEntry[]): number {
  return entries.filter((e) => e.status.includes('watching')).length;
}
