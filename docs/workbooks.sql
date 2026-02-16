-- Workbooks (lesson materials) + storage policies
-- Run once in Supabase SQL editor.

create table if not exists public.workbooks (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  category text,
  topic text not null,
  title text not null,
  description text,
  thumbnail_path text,
  thumbnail_url text,
  file_path text,
  file_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer,
  publish_at timestamp with time zone,
  unpublish_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Backfill if the column was added later
alter table public.workbooks
  add column if not exists is_featured boolean not null default false;

alter table public.workbooks
  add column if not exists sort_order integer;

alter table public.workbooks
  add column if not exists publish_at timestamp with time zone;

alter table public.workbooks
  add column if not exists unpublish_at timestamp with time zone;

create index if not exists workbooks_subject_level_idx
  on public.workbooks (subject, level_slug);

create index if not exists workbooks_topic_idx
  on public.workbooks (topic);

create index if not exists workbooks_subject_level_sort_idx
  on public.workbooks (subject, level_slug, sort_order);

alter table public.workbooks enable row level security;

-- Public can read published workbooks
drop policy if exists "Public read workbooks" on public.workbooks;
create policy "Public read workbooks"
  on public.workbooks
  for select
  to public
  using (
    is_published = true
    and (publish_at is null or publish_at <= now())
    and (unpublish_at is null or unpublish_at > now())
  );

-- Admins manage workbooks
drop policy if exists "Admins manage workbooks" on public.workbooks;
create policy "Admins manage workbooks"
  on public.workbooks
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Storage: workbook files + thumbnails
insert into storage.buckets (id, name, public)
values ('workbooks', 'workbooks', true)
on conflict (id) do update set public = true;

-- Public read for workbook files
drop policy if exists "Public read workbook files" on storage.objects;
create policy "Public read workbook files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'workbooks');

-- Admins manage workbook files
drop policy if exists "Admins insert workbook files" on storage.objects;
create policy "Admins insert workbook files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'workbooks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins update workbook files" on storage.objects;
create policy "Admins update workbook files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'workbooks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'workbooks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins delete workbook files" on storage.objects;
create policy "Admins delete workbook files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'workbooks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Workbook file version history (admin rollback)
create table if not exists public.workbook_versions (
  id uuid primary key default gen_random_uuid(),
  workbook_id uuid not null references public.workbooks(id) on delete cascade,
  file_path text,
  file_url text,
  thumbnail_path text,
  thumbnail_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index if not exists workbook_versions_workbook_idx
  on public.workbook_versions (workbook_id);

alter table public.workbook_versions enable row level security;

drop policy if exists "Admins read workbook versions" on public.workbook_versions;
create policy "Admins read workbook versions"
  on public.workbook_versions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins insert workbook versions" on public.workbook_versions;
create policy "Admins insert workbook versions"
  on public.workbook_versions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Workbook analytics (opens/downloads)
create table if not exists public.workbook_events (
  id uuid primary key default gen_random_uuid(),
  workbook_id uuid not null references public.workbooks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('open', 'download')),
  created_at timestamp with time zone default now()
);

create index if not exists workbook_events_workbook_idx
  on public.workbook_events (workbook_id);

create index if not exists workbook_events_user_idx
  on public.workbook_events (user_id);

alter table public.workbook_events enable row level security;

drop policy if exists "Admins read workbook events" on public.workbook_events;
create policy "Admins read workbook events"
  on public.workbook_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

create or replace view public.workbook_event_stats as
select
  workbook_id,
  count(*) filter (where event_type = 'open') as opens,
  count(*) filter (where event_type = 'download') as downloads,
  max(created_at) filter (where event_type = 'open') as last_opened_at,
  max(created_at) filter (where event_type = 'download') as last_downloaded_at
from public.workbook_events
group by workbook_id;
