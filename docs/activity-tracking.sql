-- Lesson views + daily activity minutes
-- Run once in Supabase SQL editor.

create table if not exists public.lesson_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  viewed_at timestamp with time zone default now()
);

create index if not exists lesson_views_user_id_idx
  on public.lesson_views (user_id);

create index if not exists lesson_views_lesson_id_idx
  on public.lesson_views (lesson_id);

create table if not exists public.user_activity_minutes (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  minutes integer not null default 0,
  updated_at timestamp with time zone default now(),
  primary key (user_id, activity_date)
);

create index if not exists user_activity_minutes_user_id_idx
  on public.user_activity_minutes (user_id);

alter table public.lesson_views enable row level security;
alter table public.user_activity_minutes enable row level security;

-- Users can read/insert their own lesson views
drop policy if exists "Users read own lesson views" on public.lesson_views;
create policy "Users read own lesson views"
  on public.lesson_views
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users insert own lesson views" on public.lesson_views;
create policy "Users insert own lesson views"
  on public.lesson_views
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Users manage their own activity minutes
drop policy if exists "Users read own activity minutes" on public.user_activity_minutes;
create policy "Users read own activity minutes"
  on public.user_activity_minutes
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users upsert own activity minutes" on public.user_activity_minutes;
create policy "Users upsert own activity minutes"
  on public.user_activity_minutes
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own activity minutes" on public.user_activity_minutes;
create policy "Users update own activity minutes"
  on public.user_activity_minutes
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
