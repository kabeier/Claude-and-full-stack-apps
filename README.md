# Claude Full-Stack App

Two ~40-minute lectures for Code Platoon Phase III, Building Applications → Full-Stack Applications. Live site: https://kabeier.github.io/Claude-and-full-stack-apps/

Each deck is a single HTML file. Open it, press **P** for presenter notes in a second window, **T** to start the lecture clock, **O** for the slide overview, **F** for fullscreen.

## Lecture 1: RESTful APIs (~40 min, 14 slides)

| ~min | Segment |
|---|---|
| 0–2 | Open: front-end ✓, database ✓, the missing API |
| 2–8 | What an API is (the kitchen), REST's four habits, CRUD |
| 8–11 | Quick-fire in chat: which request does Ticked need? (the only activity) |
| 11–13 | Anatomy of a request |
| 13–31 | Live: Postman setup, `[]` and 401 from RLS, Claude adds temporary dev rules, CRUD on the real database |
| 31–35 | Status codes (break the key, break the URL) |
| 35–40 | Wrap up, homework Part I |

## Lecture 2: Connecting it All (~40 min, 13 slides)

| ~min | Segment |
|---|---|
| 0–2 | Open |
| 2–7 | Live: Claude restructures into `front-end/` + `supabase/` + one `.claude/` |
| 7–10 | Live: `.env` and `.gitignore` |
| 10–18 | The curriculum's prompt; request flow while Claude analyzes; review its plan |
| 18–24 | Activity: Where Did It Break? (while the sub-agents build) |
| 24–32 | Claude tests with Playwright + Supabase MCP; add a task, refresh, still there |
| 32–40 | Commit, wrap up, homework Part II |

## Folder map

- `index.html`: the class landing page, with homework steps for Part I and Part II
- `lecture-1-restful-apis/`: slides
- `lecture-2-connecting-it-all/`: slides, Where Did It Break?
- `demo-kit/`: everything for the live demos. Start with `RUNBOOK.md`
  - `start-ticked/`: the starting point, Ticked as the database lecture left it (no `.mcp.json`)
  - `backup-ticked-fullstack/`: the finished, connected version
- `diagrams/`: tldraw diagrams (`.png` + editable `.tldr`)
- `shared/`: the slide engine (same as the earlier lecture sites)

## Notes on choices

- **Shorter on purpose:** one activity per lecture, and each activity runs while Claude is working. Concepts are taught next to the live step that uses them, not twice.
- **RLS:** the database lecture left RLS on with no rules, so the publishable key gets `[]` and 401. Lecture 1 turns that into a lesson and adds temporary "dev: open access until auth" policies. The authentication lecture replaces them.
- **401, not 403:** with the publishable key (the anon role), an RLS refusal comes back as 401. 403 is what a logged-in user gets.
- **Demo User:** `projects.user_id` and `tasks.user_id` are required and there are no logins yet, so Lecture 1 creates one user in Postman and Lecture 2's app uses it for every new row.
- **The connect prompt is the curriculum's, word for word.** Good answers to Claude's likely questions are in `demo-kit/prompts.md`.
- **Backup app:** `demo-kit/backup-ticked-fullstack/` changes only two files from the in-memory Ticked (`src/services/supabaseApi.js`, `src/data/db.js`). It uses `fetch`, so its requests match the Postman ones.
