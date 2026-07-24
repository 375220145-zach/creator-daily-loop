import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { PORT } from './config';
import {
  getAllFeedback,
  getFeedbackDetail,
  countProjectsWithFeedback,
  countTotalProjects,
} from './parsers/feedback';
import { getGraduationQueue, getPendingCount } from './parsers/graduation';
import { getLoops, getCronTasks, getActiveLoopCount } from './parsers/loops';
import type { Overview } from './types';

const isDev = process.env.NODE_ENV !== 'production';

async function main() {
  const app = express();
  app.use(cors());

  // ── API routes ──────────────────────────────────────────

  /** GET /api/overview — aggregated stats */
  app.get('/api/overview', (_req: Request, res: Response) => {
    try {
      const allFeedback = getAllFeedback();
      const graduation = getGraduationQueue();
      const loops = getLoops();
      const cronTasks = getCronTasks();

      const overview: Overview = {
        totalFeedback: allFeedback.length,
        recentFeedback: allFeedback.filter((f) => f.inferredStatus === 'recent').length,
        recordedFeedback: allFeedback.filter((f) => f.inferredStatus === 'recorded').length,
        autoFixedFeedback: allFeedback.filter((f) => f.inferredStatus === 'auto-fixed').length,
        observationFeedback: allFeedback.filter((f) => f.inferredStatus === 'observation').length,
        activeLoops: getActiveLoopCount(loops, cronTasks),
        pendingGraduationItems: getPendingCount(graduation),
        projectsWithFeedback: countProjectsWithFeedback(),
        totalProjects: countTotalProjects(),
      };
      res.json(overview);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  /** GET /api/feedback — list with optional filters */
  app.get('/api/feedback', (req: Request, res: Response) => {
    try {
      let items = getAllFeedback();
      const project = req.query.project as string | undefined;
      const status = req.query.status as string | undefined;
      const sort = (req.query.sort as string) || 'date';
      const order = (req.query.order as string) || 'desc';

      if (project) {
        items = items.filter((i) => i.project === project);
      }
      if (status) {
        items = items.filter((i) => i.inferredStatus === status);
      }

      if (sort === 'date') {
        items.sort((a, b) =>
          order === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
        );
      } else if (sort === 'project') {
        items.sort((a, b) =>
          order === 'desc'
            ? b.project.localeCompare(a.project)
            : a.project.localeCompare(b.project),
        );
      }

      res.json(items);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  /** GET /api/feedback/:project/:filename — full detail */
  app.get('/api/feedback/:project/:filename', (req: Request, res: Response) => {
    try {
      const detail = getFeedbackDetail(req.params.project, req.params.filename);
      if (!detail) {
        res.status(404).json({ error: 'Feedback file not found' });
        return;
      }
      res.json(detail);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  /** GET /api/graduation — graduation queue */
  app.get('/api/graduation', (_req: Request, res: Response) => {
    try {
      res.json(getGraduationQueue());
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  /** GET /api/loops — active loops + cron tasks */
  app.get('/api/loops', (_req: Request, res: Response) => {
    try {
      res.json({
        loops: getLoops(),
        cronTasks: getCronTasks(),
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  /** GET /api/projects — list projects with feedback counts */
  app.get('/api/projects', (_req: Request, res: Response) => {
    try {
      const allFeedback = getAllFeedback();
      const projectMap = new Map<string, { count: number; openCount: number }>();
      for (const f of allFeedback) {
        const entry = projectMap.get(f.project) || { count: 0, openCount: 0 };
        entry.count++;
        if (f.inferredStatus === 'recent') entry.openCount++;
        projectMap.set(f.project, entry);
      }
      const projects = Array.from(projectMap.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.count - a.count);
      res.json(projects);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ── Vite middleware (dev) or static serve (production) ──
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: process.cwd(),
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`\n🔁 Loop 知识库 → http://localhost:${PORT}\n`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
