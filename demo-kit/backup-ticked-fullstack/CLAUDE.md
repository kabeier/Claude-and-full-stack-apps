# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ticked is a full-stack task manager: tasks, projects, tags, due dates, tick to complete.

```
ticked/
├── .claude/       shared by the whole project: skills/ and agents/ (front-end-agent, supabase-agent)
├── .mcp.json      the Supabase MCP (project scope)
├── front-end/     React + Vite SPA (built from front-end/app_outline/)
├── supabase/      schema.sql, user_stories.md, task-manager-erd.png
├── CLAUDE.md
└── README.md
```

## Commands

```bash
cd front-end
npm install
npm run dev       # http://localhost:5173 (needs front-end/.env)
npm run lint      # oxlint
npm run build
```

## Architecture

- **Front-end:** React 19 + Vite + React Router DOM. Routes in `front-end/src/App.jsx`: `/` Tasks, `/tasks/new`, `/projects`, `/projects/:id`.
- **Request flow:** component → `src/context/TaskContext.jsx` → `src/data/db.js` → `src/services/supabaseApi.js` → Supabase REST API (PostgREST) → PostgreSQL.
- **API service layer:** `front-end/src/services/supabaseApi.js` is the only file that knows the Supabase URL and key. `request(method, path, body)` sends `apikey`, `Authorization: Bearer`, `Content-Type` and `Prefer: return=representation`, and throws `Supabase said <status>: <message>` on errors.
- **Data functions:** `front-end/src/data/db.js` keeps the same async exports as the in-memory version (`listProjects`, `createProject`, `deleteProject`, `listTasks`, `createTask`, `setTaskComplete`, `deleteTask`, `listTags`, `createTag`), so pages didn't change.
- **Database:** five tables in `supabase/schema.sql`: users, projects, tasks, tags, task_tags. Deleting a project sets its tasks' `project_id` to null; deleting a task cascades to `task_tags`.
- **No auth yet:** new projects and tasks use the first row in `users` as their `user_id`. RLS is on with temporary "dev: open access until auth" policies for the `anon` role. Real per-user policies come in the authentication lecture.

## Conventions

- Components never call the API. Data goes through `db.js` and the service layer.
- After every write, re-load from the database (the database is the source of truth).
- Environment variables live in `front-end/.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Never commit `.env`. Never use the secret key in front-end code.
- Don't change the schema without approval. Database work goes to `supabase-agent`, UI work to `front-end-agent`.
