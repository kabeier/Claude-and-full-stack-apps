-- Reset the task-manager Supabase project after a dry run.
-- Paste into Supabase → SQL Editor → Run.
--
-- 1. Removes EVERY policy on the public tables (whatever Claude named them),
--    so Lecture 1 starts with RLS on and no rules: GET returns [].
-- 2. Empties all five tables. The tables themselves stay.

do $$
declare p record;
begin
  for p in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

truncate public.task_tags, public.tags, public.tasks, public.projects, public.users;

-- Check: should show 0 policies
select count(*) as policies_left from pg_policies where schemaname = 'public';
