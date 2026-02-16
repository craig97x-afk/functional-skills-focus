-- Student dashboard preferences (multiple exam countdowns)
-- Run once in Supabase SQL editor.

create table if not exists public.user_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_name text not null,
  exam_date date not null,
  show_on_dashboard boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists user_exams_user_id_idx
  on public.user_exams (user_id);

alter table public.user_exams enable row level security;

-- Users can read their own exams
drop policy if exists "Users read own exams" on public.user_exams;
create policy "Users read own exams"
  on public.user_exams
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Users can insert their own exams
drop policy if exists "Users insert own exams" on public.user_exams;
create policy "Users insert own exams"
  on public.user_exams
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Users can update their own exams
drop policy if exists "Users update own exams" on public.user_exams;
create policy "Users update own exams"
  on public.user_exams
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Users can delete their own exams
drop policy if exists "Users delete own exams" on public.user_exams;
create policy "Users delete own exams"
  on public.user_exams
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Optional: migrate from legacy single-countdown table if it exists.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'user_settings'
  ) then
    insert into public.user_exams (user_id, exam_name, exam_date, show_on_dashboard)
    select user_id, 'Exam', exam_date, show_exam_countdown
    from public.user_settings
    where exam_date is not null
      and not exists (
        select 1
        from public.user_exams e
        where e.user_id = public.user_settings.user_id
          and e.exam_date = public.user_settings.exam_date
      );
  end if;
end $$;
