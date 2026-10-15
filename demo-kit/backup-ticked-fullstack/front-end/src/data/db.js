// =====================================================================
// db.js: the ONLY file in Ticked that reads or changes data.
//
// It used to keep four arrays in memory (so a refresh wiped everything).
// Now every function sends a request to Supabase through the API
// service layer (../services/supabaseApi.js), so the data lives in
// PostgreSQL and survives a refresh.
//
// The function names and what they return did NOT change, so the
// context, pages and components didn't have to change either.
//
// Tables (see supabase/schema.sql):
//   users      (id, name, email, created_at)
//   projects   (id, name, description, user_id, created_at)
//   tasks      (id, title, is_complete, due_date, project_id, user_id, created_at)
//   tags       (id, name)
//   task_tags  (task_id, tag_id)   <- joins tasks and tags (many-to-many)
// =====================================================================

import { request } from '../services/supabaseApi'

// ---------- the demo user ----------
// There's no login yet (that's a future lecture), but projects and tasks
// need a user_id. So every new row belongs to the first user in the
// users table: the one we created with Postman.
let demoUserId = null

async function getDemoUserId() {
  if (demoUserId) return demoUserId
  const users = await request('GET', 'users?select=id&order=created_at.asc&limit=1')
  if (users.length === 0) {
    throw new Error('No user yet. Add one in Supabase (Table Editor → users), then refresh.')
  }
  demoUserId = users[0].id
  return demoUserId
}

// =====================================================================
// PROJECTS
// =====================================================================

// All projects, oldest first.
export async function listProjects() {
  return request('GET', 'projects?select=*&order=created_at.asc')
}

// Add a project. Returns the new row.
export async function createProject({ name, description }) {
  const rows = await request('POST', 'projects', {
    name: name,
    description: description || null,
    user_id: await getDemoUserId(),
  })
  return rows[0]
}

// Remove a project. Its tasks stay, but lose their project:
// the database does that itself (ON DELETE SET NULL in schema.sql).
export async function deleteProject(id) {
  await request('DELETE', `projects?id=eq.${id}`)
}

// =====================================================================
// TASKS
// =====================================================================

// All tasks, newest first. Each task comes back with a `tags` array
// ([{ id, name }, ...]): PostgREST joins them in through task_tags.
export async function listTasks() {
  return request('GET', 'tasks?select=*,tags(id,name)&order=created_at.desc')
}

// Add a task (not complete yet), then link it to its tags. Returns the new row.
export async function createTask({ title, project_id, due_date, tagIds }) {
  const rows = await request('POST', 'tasks', {
    title: title,
    due_date: due_date || null,
    project_id: project_id || null,
    user_id: await getDemoUserId(),
  })
  const task = rows[0]

  if (tagIds && tagIds.length > 0) {
    // One request can insert several rows: send an array
    await request('POST', 'task_tags', tagIds.map((tagId) => ({ task_id: task.id, tag_id: tagId })))
  }
  return task
}

// Tick a task off (true) or re-open it (false). PATCH changes only this one column.
export async function setTaskComplete(id, is_complete) {
  await request('PATCH', `tasks?id=eq.${id}`, { is_complete: is_complete })
}

// Remove a task. Its task_tags rows go too (ON DELETE CASCADE in schema.sql).
export async function deleteTask(id) {
  await request('DELETE', `tasks?id=eq.${id}`)
}

// =====================================================================
// TAGS
// =====================================================================

// All tags, A to Z.
export async function listTags() {
  return request('GET', 'tags?select=id,name&order=name.asc')
}

// Add a tag. Returns the new row.
export async function createTag(name) {
  const rows = await request('POST', 'tags', { name: name })
  return rows[0]
}
