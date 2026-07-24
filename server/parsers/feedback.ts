import fs from 'node:fs';
import path from 'node:path';
import { VAULT_PATH } from '../config';
import type { FeedbackItem, FeedbackDetail, FeedbackStatus } from '../types';
import { parseFrontmatter, extractSnippet } from './frontmatter';

const FEEDBACK_GLOB = '01-Projects';

function inferStatus(
  frontmatter: Record<string, unknown>,
  filename: string,
  dateStr: string,
): FeedbackStatus {
  const type = String(frontmatter.type ?? '').toLowerCase();
  const title = String(frontmatter.title ?? '').toLowerCase();
  const fname = filename.toLowerCase();

  // Explicit markers
  if (type === 'autofix') return 'auto-fixed';
  if (
    type === 'weekly-reflection' ||
    title.includes('weekly-reflection') ||
    title.includes('周度反射') ||
    fname.includes('weekly-reflection')
  )
    return 'observation';

  // Recent (7 days) → highlight as worth checking
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const daysAgo = (Date.now() - d.getTime()) / 86400000;
      if (daysAgo <= 7) return 'recent';
    }
  }

  // Older → archived record, not an open issue
  return 'recorded';
}

function scanFeedbackDirs(): string[] {
  const projectsDir = path.join(VAULT_PATH, FEEDBACK_GLOB);
  if (!fs.existsSync(projectsDir)) return [];

  const files: string[] = [];
  const projectDirs = fs.readdirSync(projectsDir, { withFileTypes: true });

  for (const dir of projectDirs) {
    if (!dir.isDirectory()) continue;
    const feedbackDir = path.join(projectsDir, dir.name, '_feedback');
    if (!fs.existsSync(feedbackDir)) continue;

    const feedbackFiles = fs.readdirSync(feedbackDir).filter((f) => f.endsWith('.md'));
    for (const f of feedbackFiles) {
      files.push(path.join(FEEDBACK_GLOB, dir.name, '_feedback', f));
    }
  }

  return files;
}

function parseFeedbackFile(relativePath: string): FeedbackDetail | null {
  const fullPath = path.join(VAULT_PATH, relativePath);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(raw);
  const filename = path.basename(relativePath);

  // Infer project from path: 01-Projects/<project>/_feedback/<file>.md
  const pathParts = relativePath.split('/');
  const project = (frontmatter.project as string) || pathParts[1] || 'unknown';
  const date = (frontmatter.date as string) || '';

  const id = filename.replace(/\.md$/, '');
  const title = (frontmatter.title as string) || id;
  const type = (frontmatter.type as string) || null;
  const severity = (frontmatter.severity as string) || null;
  const inferredStatus = inferStatus(frontmatter, filename, date);

  return {
    id,
    project,
    date,
    title,
    type,
    severity,
    inferredStatus,
    filePath: relativePath,
    snippet: extractSnippet(body),
    frontmatter,
    body,
  };
}

/** Get all feedback items (summary, without body) */
export function getAllFeedback(): FeedbackItem[] {
  const files = scanFeedbackDirs();
  return files
    .map((f) => parseFeedbackFile(f))
    .filter(Boolean)
    .map((d) => {
      const { frontmatter: _, body: __, ...item } = d!;
      return item;
    });
}

/** Get single feedback file with full body */
export function getFeedbackDetail(project: string, filename: string): FeedbackDetail | null {
  const relativePath = `${FEEDBACK_GLOB}/${project}/_feedback/${filename}`;
  return parseFeedbackFile(relativePath);
}

/** Count projects that have at least one feedback file */
export function countProjectsWithFeedback(): number {
  const projectsDir = path.join(VAULT_PATH, FEEDBACK_GLOB);
  if (!fs.existsSync(projectsDir)) return 0;

  let count = 0;
  const dirs = fs.readdirSync(projectsDir, { withFileTypes: true });
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const fb = path.join(projectsDir, dir.name, '_feedback');
    if (fs.existsSync(fb) && fs.readdirSync(fb).some((f) => f.endsWith('.md'))) {
      count++;
    }
  }
  return count;
}

export function countTotalProjects(): number {
  const projectsDir = path.join(VAULT_PATH, FEEDBACK_GLOB);
  if (!fs.existsSync(projectsDir)) return 0;
  return fs.readdirSync(projectsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).length;
}
