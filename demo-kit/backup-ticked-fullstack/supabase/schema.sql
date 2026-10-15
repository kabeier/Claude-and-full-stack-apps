-- Backup: the Task Manager schema from the Lecture 1 DrawSQL diagram.
-- In class, Claude writes its own schema.sql from the screenshot. Use this only if that stalls.
-- Order matters: a table must exist before another table can point a foreign key at it.

create table public.users (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(100) not null,
  email       varchar(255) not null unique,
  created_at  timestamptz  not null default now()
);

create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(255) not null,
  description text,
  user_id     uuid not null references public.users (id),   -- who owns it
  created_at  timestamptz  not null default now()
);

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       varchar(255) not null,
  is_complete boolean      not null default false,
  due_date    date,
  -- nullable: a task doesn't have to be in a project.
  -- on delete set null: deleting a project keeps its tasks, they just lose the project.
  project_id  uuid references public.projects (id) on delete set null,
  user_id     uuid not null references public.users (id),   -- who owns it
  created_at  timestamptz  not null default now()
);

create table public.tags (
  id    uuid primary key default gen_random_uuid(),
  name  varchar(50) not null unique
);

-- Junction table: tasks <-> tags is many-to-many.
-- on delete cascade: deleting a task (or tag) removes its pairings, not the other side.
create table public.task_tags (
  task_id  uuid not null references public.tasks (id) on delete cascade,
  tag_id   uuid not null references public.tags (id) on delete cascade,
  primary key (task_id, tag_id)
);

-- PostgreSQL does not index foreign key columns for you
create index on public.projects (user_id);
create index on public.tasks (user_id);
create index on public.tasks (project_id);
create index on public.task_tags (tag_id);

-- Supabase: every table in the public schema is reachable through the API.
-- Row Level Security (RLS) locks each table until you add policies (rules).
-- The rules come in future lectures (the API, then logins); the dashboard can still see everything.
alter table public.users     enable row level security;
alter table public.projects  enable row level security;
alter table public.tasks     enable row level security;
alter table public.tags      enable row level security;
alter table public.task_tags enable row level security;
