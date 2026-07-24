export interface FeedbackItem {
  id: string;
  project: string;
  date: string;
  title: string;
  type: string | null;
  severity: string | null;
  inferredStatus: FeedbackStatus;
  filePath: string;
  snippet: string;
}

export type FeedbackStatus = 'recent' | 'recorded' | 'auto-fixed' | 'observation';

export interface FeedbackDetail extends FeedbackItem {
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface GraduationEntry {
  status: string;
  scope: string[];
  count: number;
  evidence: string;
  target: string;
  details: string;
}

export interface LoopEntry {
  id: string;
  name: string;
  frequency: string;
  description: string;
  type: 'infrastructure' | 'project';
  project: string | null;
}

export interface CronTask {
  id: string;
  cron: string;
  prompt: string;
  recurring: boolean;
  durable: boolean;
}

export interface Overview {
  totalFeedback: number;
  recentFeedback: number;
  recordedFeedback: number;
  autoFixedFeedback: number;
  observationFeedback: number;
  activeLoops: number;
  pendingGraduationItems: number;
  projectsWithFeedback: number;
  totalProjects: number;
}
