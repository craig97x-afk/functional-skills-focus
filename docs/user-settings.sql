-- Student dashboard preferences (exam countdown)
-- Run once in Supabase SQL editor.

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  exam_date date,
  show_exam_countdown boolean not null default false,
  updated_at timestamp with time zone default now()
);

alter table public.user_settings enable row level security;

-- Users can read their own settings
drop policy if exists "Users read own settings" on public.user_settings;
create policy "Users read own settings"
  on public.user_settings
  for select
  to authenticated
  using (user_id = auth.uid());

-- Users can insert their own settings
drop policy if exists "Users insert own settings" on public.user_settings;
create policy "Users insert own settings"
  on public.user_settings
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users can update their own settings
drop policy if exists "Users update own settings" on public.user_settings;
create policy "Users update own settings"
  on public.user_settings
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
