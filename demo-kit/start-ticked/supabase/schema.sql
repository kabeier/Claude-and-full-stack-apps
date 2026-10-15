-- Ticked task manager: schema from task-manager-erd.png (DrawSQL)
--
-- Written as the diagram shows it, plus these approved changes:
--   * RLS enabled on every table, no policies yet (only the dashboard /
--     service role can read or write until login arrives).
--   * Email uniqueness is case-insensitive (unique index on lower(email)).
--   * tasks.is_complete defaults to false.
--   * Indexes on every foreign-key column.
--   * Deleting a user keeps their projects and tasks; user_id becomes null,
--     so projects.user_id and tasks.user_id are nullable.
--   * Tags are global and shared (no user_id), as on the diagram.
--
-- Tables are in dependency order (a table comes after the tables it
-- references), which is also the order they will be created in Supabase:
--   1. users  2. projects  3. tags  4. tasks  5. task_tags
--
-- ON DELETE rules are not drawn on the diagram. The ones below follow the
-- app's documented behaviour (CLAUDE.md): deleting a project keeps its tasks
-- (project_id becomes null), deleting a task removes its task_tags rows.
-- Deleting a user keeps their data (user_id becomes null).


-- 1. users ---------------------------------------------------------------
-- Story 1: an account with a name and email.
create table public.users (
  id          uuid         primary key default gen_random_uuid(),
  name        varchar(100) not null,
  email       varchar(255) not null,
  created_at  timestamptz  not null default now()
);

create unique index users_email_lower_key on public.users (lower(email));

alter table public.users enable row level security;


-- 2. projects ------------------------------------------------------------
-- Story 2: projects with a name and an optional description.
create table public.projects (
  id           uuid         primary key default gen_random_uuid(),
  name         varchar(255) not null,
  description  text,
  user_id      uuid         references public.users (id) on delete set null,
  created_at   timestamptz  not null default now()
);

create index projects_user_id_idx on public.projects (user_id);

alter table public.projects enable row level security;


-- 3. tags ----------------------------------------------------------------
-- Story 7: labels like "school" or "urgent".
create table public.tags (
  id    uuid        primary key default gen_random_uuid(),
  name  varchar(50) not null unique
);

alter table public.tags enable row level security;


-- 4. tasks ---------------------------------------------------------------
-- Stories 3, 4, 5, 6, 8: title, optional project, optional due date,
-- complete flag, created time.
create table public.tasks (
  id           uuid         primary key default gen_random_uuid(),
  title        varchar(255) not null,
  is_complete  boolean      not null default false,
  due_date     date,
  project_id   uuid         references public.projects (id) on delete set null,
  user_id      uuid         references public.users (id) on delete set null,
  created_at   timestamptz  not null default now()
);

create index tasks_user_id_idx    on public.tasks (user_id);
create index tasks_project_id_idx on public.tasks (project_id);

alter table public.tasks enable row level security;


-- 5. task_tags -----------------------------------------------------------
-- Story 7: many-to-many join, a task can have several tags.
create table public.task_tags (
  task_id  uuid not null references public.tasks (id) on delete cascade,
  tag_id   uuid not null references public.tags (id)  on delete cascade,
  primary key (task_id, tag_id)
);

-- task_id is covered by the primary key; tag_id needs its own index.
create index task_tags_tag_id_idx on public.task_tags (tag_id);

alter table public.task_tags enable row level security;
