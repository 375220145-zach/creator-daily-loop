# Loop 知识库仪表盘

本地知识库仪表盘，聚合 Agent Loop System 的所有产出数据。

## 技术栈

Express + TypeScript + Vite + React 19 + Tailwind CSS v4

## 启动

```bash
npm run dev
```

打开 `http://localhost:3002`

## 数据源

读取 Obsidian Vault 中的文件，每次 API 请求实时扫描，不缓存：

- `01-Projects/*/\_feedback/*.md` — 各项目反馈文件
- `04-Feedback/graduation-queue.md` — 跨项目原则候审
- `02-Sources/loop-registry.md` — 活跃循环注册表
- `~/.claude/scheduled_tasks.json` — Cron 调度任务

## 项目结构

- `server/` — Express 后端 + API 路由 + 数据解析器
- `src/` — React 前端
