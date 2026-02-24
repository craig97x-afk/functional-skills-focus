-- Exam mocks + question banks (resources by level)
-- Run once in Supabase SQL editor.

create table if not exists public.exam_mocks (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  exam_board text,
  title text not null,
  description text,
  cover_url text,
  file_path text,
  file_url text,
  paper_type text,
  paper_year integer,
  tags text[] not null default '{}'::text[],
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer,
  publish_at timestamp with time zone,
  unpublish_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint exam_mocks_paper_year_check
    check (paper_year is null or (paper_year >= 2000 and paper_year <= 2100))
);

-- Backfill if columns were added later
alter table public.exam_mocks
  add column if not exists is_featured boolean not null default false;

alter table public.exam_mocks
  add column if not exists exam_board text;

alter table public.exam_mocks
  add column if not exists sort_order integer;

alter table public.exam_mocks
  add column if not exists publish_at timestamp with time zone;

alter table public.exam_mocks
  add column if not exists unpublish_at timestamp with time zone;

alter table public.exam_mocks
  add column if not exists paper_type text;

alter table public.exam_mocks
  add column if not exists paper_year integer;

alter table public.exam_mocks
  add column if not exists tags text[] not null default '{}'::text[];

create table if not exists public.question_sets (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  exam_board text,
  title text not null,
  description text,
  cover_url text,
  content text,
  resource_url text,
  paper_type text,
  paper_year integer,
  tags text[] not null default '{}'::text[],
  is_published boolean not null default false,
  sort_order integer,
  publish_at timestamp with time zone,
  unpublish_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint question_sets_paper_year_check
    check (paper_year is null or (paper_year >= 2000 and paper_year <= 2100))
);

create table if not exists public.exam_resource_links (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  exam_board text,
  title text not null,
  description text,
  link_url text not null,
  link_type text,
  paper_type text,
  paper_year integer,
  tags text[] not null default '{}'::text[],
  health_status text not null default 'unchecked',
  last_checked_at timestamp with time zone,
  last_status_code integer,
  last_error text,
  is_published boolean not null default false,
  sort_order integer,
  publish_at timestamp with time zone,
  unpublish_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint exam_resource_links_paper_year_check
    check (paper_year is null or (paper_year >= 2000 and paper_year <= 2100)),
  constraint exam_resource_links_health_status_check
    check (health_status in ('unchecked', 'ok', 'broken'))
);

-- Optional backfill columns for interactive sets and metadata
alter table public.question_sets
  add column if not exists content text;

alter table public.question_sets
  add column if not exists exam_board text;

alter table public.question_sets
  add column if not exists sort_order integer;

alter table public.question_sets
  add column if not exists publish_at timestamp with time zone;

alter table public.question_sets
  add column if not exists unpublish_at timestamp with time zone;

alter table public.question_sets
  add column if not exists paper_type text;

alter table public.question_sets
  add column if not exists paper_year integer;

alter table public.question_sets
  add column if not exists tags text[] not null default '{}'::text[];

alter table public.exam_resource_links
  add column if not exists paper_type text;

alter table public.exam_resource_links
  add column if not exists paper_year integer;

alter table public.exam_resource_links
  add column if not exists tags text[] not null default '{}'::text[];

alter table public.exam_resource_links
  add column if not exists health_status text not null default 'unchecked';

alter table public.exam_resource_links
  add column if not exists last_checked_at timestamp with time zone;

alter table public.exam_resource_links
  add column if not exists last_status_code integer;

alter table public.exam_resource_links
  add column if not exists last_error text;

create index if not exists exam_mocks_subject_level_idx
  on public.exam_mocks (subject, level_slug);

create index if not exists question_sets_subject_level_idx
  on public.question_sets (subject, level_slug);

create index if not exists exam_resource_links_subject_level_idx
  on public.exam_resource_links (subject, level_slug);

create index if not exists exam_mocks_subject_level_board_idx
  on public.exam_mocks (subject, level_slug, exam_board);

create index if not exists question_sets_subject_level_board_idx
  on public.question_sets (subject, level_slug, exam_board);

create index if not exists exam_resource_links_subject_level_board_idx
  on public.exam_resource_links (subject, level_slug, exam_board);

-- Filter/query indexes for resource pages
create index if not exists exam_mocks_public_filter_idx
  on public.exam_mocks (subject, level_slug, is_published, sort_order, created_at desc);

create index if not exists question_sets_public_filter_idx
  on public.question_sets (subject, level_slug, is_published, sort_order, created_at desc);

create index if not exists exam_resource_links_public_filter_idx
  on public.exam_resource_links (subject, level_slug, is_published, sort_order, created_at desc);

create index if not exists exam_mocks_paper_metadata_idx
  on public.exam_mocks (subject, level_slug, paper_type, paper_year);

create index if not exists question_sets_paper_metadata_idx
  on public.question_sets (subject, level_slug, paper_type, paper_year);

create index if not exists exam_resource_links_paper_metadata_idx
  on public.exam_resource_links (subject, level_slug, paper_type, paper_year);

create index if not exists exam_resource_links_health_status_idx
  on public.exam_resource_links (health_status, last_checked_at);

create index if not exists exam_mocks_tags_gin_idx
  on public.exam_mocks using gin (tags);

create index if not exists question_sets_tags_gin_idx
  on public.question_sets using gin (tags);

create index if not exists exam_resource_links_tags_gin_idx
  on public.exam_resource_links using gin (tags);

-- Prevent duplicate link rows per board/level (plus a null-board guard)
create unique index if not exists exam_resource_links_unique_idx
  on public.exam_resource_links (subject, level_slug, exam_board, link_url);

create unique index if not exists exam_resource_links_unique_null_board_idx
  on public.exam_resource_links (subject, level_slug, link_url)
  where exam_board is null;

alter table public.exam_mocks enable row level security;
alter table public.question_sets enable row level security;
alter table public.exam_resource_links enable row level security;

-- Public can read published mocks and question sets
-- (including scheduled publish/unpublish windows)
drop policy if exists "Public read exam mocks" on public.exam_mocks;
create policy "Public read exam mocks"
  on public.exam_mocks
  for select
  to public
  using (
    is_published = true
    and (publish_at is null or publish_at <= now())
    and (unpublish_at is null or unpublish_at > now())
  );

drop policy if exists "Public read question sets" on public.question_sets;
create policy "Public read question sets"
  on public.question_sets
  for select
  to public
  using (
    is_published = true
    and (publish_at is null or publish_at <= now())
    and (unpublish_at is null or unpublish_at > now())
  );

drop policy if exists "Public read exam resource links" on public.exam_resource_links;
create policy "Public read exam resource links"
  on public.exam_resource_links
  for select
  to public
  using (
    is_published = true
    and (publish_at is null or publish_at <= now())
    and (unpublish_at is null or unpublish_at > now())
  );

-- Admins manage mocks and question sets
drop policy if exists "Admins manage exam mocks" on public.exam_mocks;
create policy "Admins manage exam mocks"
  on public.exam_mocks
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

drop policy if exists "Admins manage question sets" on public.question_sets;
create policy "Admins manage question sets"
  on public.question_sets
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

drop policy if exists "Admins manage exam resource links" on public.exam_resource_links;
create policy "Admins manage exam resource links"
  on public.exam_resource_links
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

-- Analytics for exam resources (mocks/sets/external links)
create table if not exists public.exam_resource_events (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('exam_mock', 'question_set', 'exam_resource_link')),
  resource_id uuid not null,
  subject text not null,
  level_slug text not null,
  event_type text not null check (event_type in ('open', 'download')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index if not exists exam_resource_events_resource_idx
  on public.exam_resource_events (resource_type, resource_id);

create index if not exists exam_resource_events_subject_level_idx
  on public.exam_resource_events (subject, level_slug, event_type, created_at desc);

create index if not exists exam_resource_events_user_id_idx
  on public.exam_resource_events (user_id);

alter table public.exam_resource_events enable row level security;

drop policy if exists "Admins read exam resource events" on public.exam_resource_events;
create policy "Admins read exam resource events"
  on public.exam_resource_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

create or replace view public.exam_resource_event_stats as
select
  resource_type,
  resource_id,
  count(*) filter (where event_type = 'open') as opens,
  count(*) filter (where event_type = 'download') as downloads,
  max(created_at) filter (where event_type = 'open') as last_opened_at,
  max(created_at) filter (where event_type = 'download') as last_downloaded_at
from public.exam_resource_events
group by resource_type, resource_id;

-- Storage: exam mock files + covers
insert into storage.buckets (id, name, public)
values ('exam-mocks', 'exam-mocks', true)
on conflict (id) do update set public = true;

-- Public read for exam mock files
drop policy if exists "Public read exam mock files" on storage.objects;
create policy "Public read exam mock files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'exam-mocks');

-- Admins manage exam mock files
drop policy if exists "Admins insert exam mock files" on storage.objects;
create policy "Admins insert exam mock files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins update exam mock files" on storage.objects;
create policy "Admins update exam mock files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins delete exam mock files" on storage.objects;
create policy "Admins delete exam mock files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );
