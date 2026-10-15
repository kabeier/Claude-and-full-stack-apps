# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ticked is a mobile-first task manager SPA: tasks, projects, tags, due dates, tick to complete. It was built from the specs in `app_outline/` (read `user_journey.md` first, then `app.png`, then `pages/*/user_story.md` and the wireframe next to each, then `style_guide.md`).

There is no backend yet. All data lives in memory, so a browser refresh resets it to the seed data. That is expected.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run lint      # oxlint
npm run build     # BASE=/sub/path/ npm run build for a sub-folder deploy
```

## Architecture

- **Stack:** React 19 + Vite + React Router DOM (`BrowserRouter`, `basename` = Vite's `BASE_URL`).
- **Routes** (`src/App.jsx`): `/` Tasks, `/tasks/new` New Task (`?project=<id>` pre-picks a project), `/projects` Projects, `/projects/:id` Project Detail, `*` Not Found.
- **Data layer: `src/data/db.js` is the ONLY file that reads or changes data.** It holds four arrays shaped like the planned database tables: `projects`, `tasks`, `tags`, `task_tags` (many-to-many join). Every export is `async` so it can later be swapped for a real API without touching the UI:
  - `listProjects`, `createProject`, `deleteProject`
  - `listTasks` (each task returned with `tags: [{ id, name }]`), `createTask`, `setTaskComplete`, `deleteTask`
  - `listTags`, `createTag`
- **State:** `src/context/TaskContext.jsx` loads everything through `db.js` on mount and exposes the data, `loading`, `error`, and actions. Components read it with `useTasks()` (`src/context/useTasks.js`).
- **Pages** in `src/pages/`, shared UI in `src/components/` (TaskRow, TaskList, ConfirmDialog, Toast, ErrorBanner, BottomNav, …), helpers in `src/utils/` (dates, task sorting, tag colors).
- `src/main.jsx` handles the GitHub Pages `?p=` deep-link redirect.

## Conventions

- Keep all data access in `src/data/db.js`; components never touch the arrays directly.
- Column names match the database: `id` (UUID), `created_at`, `is_complete`, `due_date` (`YYYY-MM-DD` or null), `project_id` (or null).
- Deleting a project keeps its tasks (their `project_id` becomes null). Deleting a task removes its `task_tags` rows.
- Validation messages, empty states and confirm dialogs use the exact wording in the user stories.
- Mobile-first, 44px touch targets, real form controls with labels, visible focus, `prefers-reduced-motion` respected.

## Agents and skills

- `.claude/agents/front-end-agent.md`: front-end specialist (Context7, Playwright, Chrome DevTools MCPs).
- `.claude/skills/`: frontend-design, ui-ux-pro-max, taste-skill, design-motion-principles.
