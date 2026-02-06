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
values ('default', '#0071e3', '#005cc5')
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

-- Anyone can read theme settings
create policy if not exists "Public read app settings"
  on public.app_settings
  for select
  to public
  using (true);

-- Only admins can update theme settings
create policy if not exists "Admins update app settings"
  on public.app_settings
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Allow admin upsert via insert
create policy if not exists "Admins insert app settings"
  on public.app_settings
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
