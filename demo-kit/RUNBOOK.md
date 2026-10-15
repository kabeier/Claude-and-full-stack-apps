# Live demo runbook: Ticked goes full-stack

**The story:** Ticked (front-end) and its Supabase database were both built, but not connected.
- **Lecture 1 (RESTful APIs):** use the database's API by hand in Postman. Add temporary RLS rules so the publishable key works. Create the Demo User.
- **Lecture 2 (Connecting it All):** restructure into `front-end/` + `supabase/` + one `.claude/`, make `.env`, and have Claude's two sub-agents connect Ticked. Add a task, refresh, it's still there.

## What's in the kit

| File | What it is |
|---|---|
| `prompts.md` | Every prompt, in order, with the folder to run it in, plus good answers to Claude's questions |
| `dev-policies.sql` | Backup for the RLS prompt (SQL Editor → Run) |
| `reset-supabase.sql` | After a dry run: removes all policies and empties the 5 tables |
| `Ticked-API.postman_collection.json` | Backup for the Postman demo (Postman → Import) |
| `restructure.sh` | Backup for the restructure prompt |
| `start-ticked/` | **The starting point:** Ticked as the database lecture left it (app in the root, `supabase/` inside with the db skill, `schema.sql`, stories, ERD). No `.mcp.json` (it holds your project ref, so it's never committed) |
| `backup-ticked-fullstack/` | Ticked after Lecture 2: restructured and connected. Tested against PostgREST (the engine behind Supabase's API) with this schema and these policies |

## Setup (once, before Lecture 1)

Starting point: `~/demos/ticked` as the database lecture left it (the app in the root, `supabase/` inside with `.mcp.json`, the db skill, `schema.sql`), and the `task-manager` Supabase project with its 5 tables. **Keep that Supabase project.** `demo-kit/start-ticked/` is a copy of that folder, minus `.mcp.json` and `node_modules`.

```bash
cp -r /mnt/storage/CP/new_Lectures/claude-fs-apps/demo-kit ~/fs-kit

# No ~/demos/ticked yet (or want a clean one)? Start from the kit copy:
#   rm -rf ~/demos/ticked && cp -r ~/fs-kit/start-ticked ~/demos/ticked
#   cd ~/demos/ticked && npm install
#   cd supabase && claude mcp add --scope project --transport http supabase "<command from Supabase → Connect → MCP>"
#   (or copy your old supabase/.mcp.json in)

claude mcp list                  # context7 and playwright, both connected
ls ~/demos/ticked/supabase/.claude/agents     # supabase-agent.md should be there
# missing?  mkdir -p ~/demos/ticked/supabase/.claude/agents && cp /mnt/storage/CP/new_Lectures/claude-supabase-db/demo-kit/.claude/agents/supabase-agent.md ~/demos/ticked/supabase/.claude/agents/

# Make it a git repo (Lecture 2 shows .env staying out of git)
cd ~/demos/ticked
git init 2>/dev/null; printf '.mcp.json\n' >> .gitignore; git add -A && git commit -qm "Ticked: front-end + database"

# Snapshot for resetting after the dry run
cp -a ~/demos/ticked ~/demos/ticked-snapshot
```

Install Postman and sign in. Log in to supabase.com in the browser you present from.

## Dry run (the night before), then reset

1. Run both lectures' live steps from the table below, start to finish. Note what Claude asks and how long the Lecture 2 build takes.
2. Reset the folder:
   ```bash
   rm -rf ~/demos/ticked && cp -a ~/demos/ticked-snapshot ~/demos/ticked
   ```
3. Reset Supabase: SQL Editor → paste `reset-supabase.sql` → Run. It should say `policies_left = 0`.
4. Postman: delete the dry-run collection (or keep it as your backup).
5. Check: `GET /users` in Postman returns `[]`. That's the Lecture 1 starting point.

## Lecture 1 in class (RESTful APIs)

| Slide (~min) | Where | Do | Say |
|---|---|---|---|
| 8 (~13) | Supabase + Postman | Integrations → Data API: copy URL (no `/rest/v1`). Project Settings → API Keys: copy publishable key. Postman: collection "Ticked API", Variables `base_url` + `publishable_key`, **Save**. New request, Headers → Bulk Edit → paste the 3 lines. `GET {{base_url}}/rest/v1/users` | "Supabase wrote the manual for our API: the Docs link." |
| 9 (~17) | Postman | Send GET: **200 `[]`**. Duplicate → POST users with the Demo User body: **401** "violates row-level security policy" | "200 but empty. 401 though the key is right. Read the message." |
| 10 (~20) | terminal | `cd ~/demos/ticked/supabase && claude`, paste the RLS prompt, read the SQL, approve. Dashboard: Authentication → Policies | "Temporary. Logins replace it." |
| 11 (~23) | Postman + Table Editor | POST users (add `Prefer:return=representation`) → 201, copy id. POST tasks with `user_id` → 201 (try without user_id: 400). GET `tasks?is_complete=eq.false`. PATCH → 204. DELETE → 204. **Keep the Demo User.** | "Postman changed a real row." |
| 12 (~31) | Postman | Break the key → 401 "Invalid API key". `/taks` → 404 | "The status code is your first clue." |

## Lecture 2 in class (Connecting it All)

| Slide (~min) | Where | Do | Say |
|---|---|---|---|
| 4 (~3) | terminal | `cd ~/demos/ticked && claude`, paste the restructure prompt, read the plan, approve. Exit, `claude` again → **Use this MCP server** → `/mcp` (authenticate if asked) → `/agents` (both). Second tab: `cd front-end && npm run dev` still works, Ctrl+C | "One project, two halves, one .claude." |
| 5 (~7) | editor + terminal | Create `front-end/.env` (URL + publishable key). Make the root `.gitignore` with `.env`. `git status`: no `.env`. Commit: `git add -A && git commit -m "Restructure: front-end + supabase"` | "Secrets are yours to handle, not Claude's." |
| 6 (~10) | Claude | `/model` → Opus. Paste the connect prompt | — |
| 7 (~11) | slides | Request-flow diagram while Claude analyzes | "Same request as Postman, sent by Ticked." |
| 8 (~14) | Claude | Read the plan out loud. Answer its questions (prompts.md → "Likely questions"). Approve; allow edits for the session; approve MCP calls one by one | "Correct it now, before code changes." |
| 9 (~18) | browser | "Where did it break?" while the agents build | — |
| 10 (~24) | Claude | Approve Playwright + Supabase MCP calls. Read the summary's assumptions | "Assumptions are decisions made for you." |
| 11 (~28) | browser | `npm run dev` in front-end. Add a task, **refresh**: still there. Table Editor row. Insert a row in the Table Editor → refresh Ticked. DevTools → Network: same request as Postman | "The database is the source of truth." |
| 12 (~32) | terminal | `git status` (no .env), commit | — |

**Time check, Lecture 2:** the build (slides 8–10) is the risky part. If Claude isn't testing by ~min 28:
1. Stop Claude (Esc). Undo its half-done changes: `cd ~/demos/ticked && git checkout -- front-end && git clean -fd front-end/src`
2. `cp ~/fs-kit/backup-ticked-fullstack/front-end/src/data/db.js ~/demos/ticked/front-end/src/data/db.js`
3. `mkdir -p ~/demos/ticked/front-end/src/services && cp ~/fs-kit/backup-ticked-fullstack/front-end/src/services/supabaseApi.js ~/demos/ticked/front-end/src/services/`
4. `npm run dev` in `front-end/` and do the payoff. Say: "This is what Claude was building: two files changed." Open both.

The backup needs the Demo User row (from Lecture 1) and the dev policies.

## Heads-up for the authentication lecture

It backs up and drops these tables, rebuilds `users` as a mirror of `auth.users`, and replaces the "dev: open access until auth" policies with per-user rules on `user_id`. The Demo User approach in `db.js` goes away then.
