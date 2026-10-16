# Prompts for the full-stack lectures

Copy them from here during class. Each one says which folder Claude runs in.

---

## Lecture 1, slide 9: open the tables for development (RLS)

**Where:** Claude running in `~/demos/ticked/supabase` (the session with the Supabase MCP from the database lecture).

```text
My tables have Row Level Security on with no policies, so my publishable key gets [] back
in Postman and can't add rows. We don't have logins yet.

Using the Supabase MCP, add TEMPORARY development policies that let the anon role read and
write all five tables (users, projects, tasks, tags, task_tags). Name each one
"dev: open access until auth". Show me the SQL first and wait for my approval.
```

**Backup:** paste `dev-policies.sql` into Supabase → SQL Editor → Run.

---

## Lecture 2, slide 3: restructure into front-end/ + supabase/

**Where:** exit Claude, `cd ~/demos/ticked`, start `claude` there (the project root).

```text
Restructure this project into the full-stack layout below. Move files only: don't change any code.

ticked/
├── .claude/      skills/ and agents/ from BOTH ./.claude and ./supabase/.claude, merged
├── .mcp.json     moved up from supabase/
├── front-end/    everything that belongs to the React app (src, public, app_outline,
│                 index.html, package files, vite and lint config, .gitignore, node_modules)
├── supabase/     schema.sql, user_stories.md and the ERD screenshot
├── CLAUDE.md     update it to describe both halves
└── README.md

Show me the plan (what moves where) first and wait for my approval.
```

**Backup:** `bash ~/fs-kit/restructure.sh ~/demos/ticked`

After it's done: exit Claude, start `claude` again in `~/demos/ticked`, choose **Use this MCP server**, and check `/mcp` (supabase connected; re-authenticate if asked) and `/agents` (front-end-agent and supabase-agent).

---

## Lecture 2, slide 6: connect it all (from the curriculum, word for word)

**Where:** Claude in `~/demos/ticked` (the root). Switch to Opus first: `/model`.

```text
My current front-end application is working as desired and I want to preserve the existing UI and user experience along with my supabase projects database structure. Now I would like to integrate these two projects as one (expose API endpoints and connect UI actions within the React app to the Supabase project) to create a full stack application.

I want you to use the subagents of front-end-agent and supabase-agent to communicate with one another to accomplish this task while using you as their main orchestrator for this task.

Do not change any fundamental functionality and/or data without my approval.

**DO NOT IMPLEMENT AUTHENTICATION NOR AUTHORIZATION PRINCIPLES**

Once the Sub-Agents return a completed action use both the Playwright MCP and the Supabase MCP to walk through the applications features yourself and test them out to ensure a successful integration.
```

### Likely questions from Claude, and good answers

Paste or adapt this if Claude asks before it plans:

```text
- user_id: there's no login yet. Use the first user in the users table (the one I made in
  Postman) for every new project and task. Don't add a login or change the schema.
- Seed data: remove it. The database is the only source of truth now.
- Keys: I already put VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in front-end/.env.
  Use import.meta.env. Never use the secret key.
- RLS: keep the existing "dev: open access until auth" policies. Don't add or remove policies.
- Read scope: show all rows (no per-user filter). Logins add that later.
- API: the Supabase auto REST API (PostgREST) via supabase-js. No RPC functions, no Edge Functions.
- Use supabase-js (@supabase/supabase-js) and keep all Supabase code in one service file.
  (The authentication lecture uses supabase-js for logins, so this saves a rewrite.)
```

**Backup:** `backup-ticked-fullstack/` (see its README).
