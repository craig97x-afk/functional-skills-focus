-- Dashboard widget preferences
-- Run once in Supabase SQL editor.

create table if not exists public.user_dashboard_widgets (
  user_id uuid not null references auth.users(id) on delete cascade,
  widget_key text not null,
  is_enabled boolean not null default true,
  updated_at timestamp with time zone default now(),
  primary key (user_id, widget_key)
);

alter table public.user_dashboard_widgets enable row level security;

drop policy if exists "Users read own dashboard widgets" on public.user_dashboard_widgets;
create policy "Users read own dashboard widgets"
  on public.user_dashboard_widgets
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users insert own dashboard widgets" on public.user_dashboard_widgets;
create policy "Users insert own dashboard widgets"
  on public.user_dashboard_widgets
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users update own dashboard widgets" on public.user_dashboard_widgets;
create policy "Users update own dashboard widgets"
  on public.user_dashboard_widgets
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users delete own dashboard widgets" on public.user_dashboard_widgets;
create policy "Users delete own dashboard widgets"
  on public.user_dashboard_widgets
  for delete
  to authenticated
  using (user_id = auth.uid());
