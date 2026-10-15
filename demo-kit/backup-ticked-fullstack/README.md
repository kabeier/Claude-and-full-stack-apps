# Ticked: full-stack backup

Ticked after the "Connecting it All" lecture: the React app in `front-end/`, the database files in `supabase/`, one shared `.claude/`, and the app talking to Supabase through an API service layer.

Use it if the live integration stalls.

## Use it

1. Copy your `.mcp.json` (the Supabase MCP) into this folder's root, if you want Claude here.
2. Make `front-end/.env` from `front-end/.env.example` with your project URL and publishable key.
3. In Supabase, the tables from `supabase/schema.sql` must exist, with the dev policies (`../dev-policies.sql`) and at least one row in `users`.
4. Run it:

```bash
cd front-end
npm install
npm run dev
```

## What changed from the in-memory app

Only two files:

- `front-end/src/services/supabaseApi.js` (new): the API service layer. It builds and sends each request.
- `front-end/src/data/db.js` (rewritten): the same functions as before, now calling the service layer instead of editing arrays.

Everything else (context, pages, components, styles) is the same as the SPA version.
