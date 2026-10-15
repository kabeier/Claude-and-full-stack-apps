// =====================================================================
// supabaseApi.js: the API service layer.
//
// This is the ONLY file that knows Supabase's address and key. It sends
// the same HTTP requests we sent by hand in Postman:
//
//   GET    /rest/v1/tasks?select=*            read
//   POST   /rest/v1/tasks        + JSON body  create
//   PATCH  /rest/v1/tasks?id=eq.<id> + body   update
//   DELETE /rest/v1/tasks?id=eq.<id>          delete
//
// The address and key come from front-end/.env (never commit that file):
//   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<your-publishable-key>
// =====================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Send one request to Supabase's auto-generated REST API.
//   method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
//   path:   the part after /rest/v1/, e.g. 'tasks?id=eq.42'
//   body:   a JS object or array (POST and PATCH only)
// Returns the JSON Supabase sends back, or null when there's nothing (204).
export async function request(method, path, body) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing Supabase settings: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to front-end/.env, then restart npm run dev.')
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      // Ask Supabase to send the new or changed row back (otherwise POST returns an empty body)
      Prefer: 'return=representation',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  // Read the body once. Errors come back as JSON too: { code, message, details, hint }
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    // The status code is the first clue: 400 bad data, 401/403 not allowed (RLS), 404 wrong table name
    const reason = data?.message || response.statusText
    throw new Error(`Supabase said ${response.status}: ${reason}`)
  }
  return data
}
