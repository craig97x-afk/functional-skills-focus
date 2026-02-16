-- Study plan items (weekly goals/checklist)
-- Run once in Supabase SQL editor.

create table if not exists public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_date date,
  completed boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists study_plan_items_user_id_idx
  on public.study_plan_items (user_id);

alter table public.study_plan_items enable row level security;

-- Users can read their own plan items
drop policy if exists "Users read plan items" on public.study_plan_items;
create policy "Users read plan items"
  on public.study_plan_items
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Users can insert their own plan items
drop policy if exists "Users insert plan items" on public.study_plan_items;
create policy "Users insert plan items"
  on public.study_plan_items
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Users can update their own plan items
drop policy if exists "Users update plan items" on public.study_plan_items;
create policy "Users update plan items"
  on public.study_plan_items
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Users can delete their own plan items
drop policy if exists "Users delete plan items" on public.study_plan_items;
create policy "Users delete plan items"
  on public.study_plan_items
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
