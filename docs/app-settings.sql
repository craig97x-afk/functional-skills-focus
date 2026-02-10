-- App-wide settings (theme accent colors)
-- Run once in Supabase SQL editor.

create table if not exists public.app_settings (
  id text primary key,
  accent_color text,
  accent_strong text,
  updated_at timestamp with time zone default now()
);

-- Ensure a default row exists
insert into public.app_settings (id, accent_color, accent_strong)
values ('default', '#0b2a4a', '#071b31')
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

-- Anyone can read theme settings
drop policy if exists "Public read app settings" on public.app_settings;
create policy "Public read app settings"
  on public.app_settings
  for select
  to public
  using (true);

-- Remove admin write access (lock theme to defaults)
drop policy if exists "Admins update app settings" on public.app_settings;
drop policy if exists "Admins insert app settings" on public.app_settings;

-- Reset accent colors to the current site defaults
update public.app_settings
set accent_color = '#0b2a4a',
    accent_strong = '#071b31',
    updated_at = now()
where id = 'default';
