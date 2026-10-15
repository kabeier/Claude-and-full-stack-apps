// =====================================================================
// db.js: the ONLY file in Ticked that reads or changes data.
//
// Right now the "database" is four plain arrays that live in memory,
// shaped exactly like the tables in schema.sql:
//
//   projects   (id, name, description, created_at)
//   tasks      (id, title, is_complete, due_date, project_id, created_at)
//   tags       (id, name)
//   task_tags  (task_id, tag_id)   <- joins tasks and tags (many-to-many)
//
// Because they are just variables, refreshing the browser runs this
// file again and everything goes back to the seed data below.
//
// Every function is `async` and returns a Promise, even though arrays
// answer instantly. A real database answers over the network, so when
// we swap this file for calls to a real API, the rest of the app
// (context, pages, components) doesn't have to change at all.
// =====================================================================

// ---------- the "tables" ----------
let projects = []
let tasks = []
let tags = []
let task_tags = []

// ---------- small helpers ----------

// A new random id, like Postgres's gen_random_uuid()
function newId() {
  return crypto.randomUUID()
}

// A timestamp string, like Postgres's now()
function now() {
  return new Date().toISOString()
}

// A 'YYYY-MM-DD' date string, N days from today (negative = in the past)
function dateFromToday(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

// A created_at timestamp N days ago
function daysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

// ---------- seed data (what you see on every fresh load) ----------
function seed() {
  const school = { id: newId(), name: 'School', description: 'Classes and homework', created_at: daysAgo(14) }
  const home = { id: newId(), name: 'Home', description: 'Chores and errands', created_at: daysAgo(14) }
  const side = { id: newId(), name: 'Side Project', description: 'The portfolio app', created_at: daysAgo(10) }
  projects = [school, home, side]

  const schoolTag = { id: newId(), name: 'school' }
  const urgentTag = { id: newId(), name: 'urgent' }
  const errandsTag = { id: newId(), name: 'errands' }
  const readingTag = { id: newId(), name: 'reading' }
  tags = [schoolTag, urgentTag, errandsTag, readingTag]

  // Each seed task lists its tags; we split those into task_tags rows below.
  const seedTasks = [
    { title: 'Finish lab report', project: school, due: 2, done: false, added: 2, tags: [schoolTag, urgentTag] },
    { title: 'Read chapter 4', project: school, due: 5, done: false, added: 3, tags: [schoolTag, readingTag] },
    { title: 'Buy groceries', project: home, due: 1, done: false, added: 1, tags: [errandsTag] },
    { title: 'Fix leaky faucet', project: home, due: null, done: true, added: 6, tags: [] },
    { title: 'Sketch the home page', project: side, due: 7, done: false, added: 4, tags: [] },
    { title: 'Call the dentist', project: null, due: 0, done: false, added: 0, tags: [urgentTag] },
  ]

  tasks = []
  task_tags = []
  for (const t of seedTasks) {
    const task = {
      id: newId(),
      title: t.title,
      is_complete: t.done,
      due_date: t.due === null ? null : dateFromToday(t.due),
      project_id: t.project ? t.project.id : null,
      created_at: daysAgo(t.added),
    }
    tasks.push(task)
    for (const tag of t.tags) {
      task_tags.push({ task_id: task.id, tag_id: tag.id })
    }
  }
}

seed()

// =====================================================================
// PROJECTS
// =====================================================================

// All projects, oldest first.
export async function listProjects() {
  return [...projects].sort((a, b) => a.created_at.localeCompare(b.created_at))
}

// Add a project. Returns the new row.
export async function createProject({ name, description }) {
  const project = {
    id: newId(),
    name: name,
    description: description || null,
    created_at: now(),
  }
  projects.push(project)
  return project
}

// Remove a project. Its tasks stay, but lose their project
// (this is what ON DELETE SET NULL does in schema.sql).
export async function deleteProject(id) {
  projects = projects.filter((p) => p.id !== id)
  tasks = tasks.map((t) => (t.project_id === id ? { ...t, project_id: null } : t))
}

// =====================================================================
// TASKS
// =====================================================================

// All tasks, newest first. Each task comes back with a `tags` array
// ([{ id, name }, ...]) joined in through task_tags.
export async function listTasks() {
  const newestFirst = [...tasks].sort((a, b) => b.created_at.localeCompare(a.created_at))

  return newestFirst.map((task) => {
    const tagIds = task_tags.filter((tt) => tt.task_id === task.id).map((tt) => tt.tag_id)
    const taskTags = tags.filter((tag) => tagIds.includes(tag.id))
    return { ...task, tags: taskTags }
  })
}

// Add a task (not complete yet) and link it to its tags. Returns the new row.
export async function createTask({ title, project_id, due_date, tagIds }) {
  const task = {
    id: newId(),
    title: title,
    is_complete: false,
    due_date: due_date || null,
    project_id: project_id || null,
    created_at: now(),
  }
  tasks.push(task)

  for (const tagId of tagIds || []) {
    task_tags.push({ task_id: task.id, tag_id: tagId })
  }
  return task
}

// Tick a task off (true) or re-open it (false).
export async function setTaskComplete(id, is_complete) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, is_complete: is_complete } : t))
}

// Remove a task and its tag pairings
// (this is what ON DELETE CASCADE on task_tags does in schema.sql).
export async function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id)
  task_tags = task_tags.filter((tt) => tt.task_id !== id)
}

// =====================================================================
// TAGS
// =====================================================================

// All tags, in the order they were added.
export async function listTags() {
  return [...tags]
}

// Add a tag. Returns the new row.
export async function createTag(name) {
  const tag = { id: newId(), name: name }
  tags.push(tag)
  return tag
}
