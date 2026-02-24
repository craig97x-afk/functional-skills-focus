-- Combined Supabase SQL (tables + policies + storage) from project docs
-- Paste into Supabase SQL editor to apply everything at once.
-- Includes: admin-audit, media-library, workbooks, exam-resources, guides,
-- guardian, notes-flashcards, activity-tracking, user-settings, study-plan,
-- dashboard-widgets, achievements, progress-comments, support-chat.



-- ==== admin-audit.sql ====

-- Admin audit log + undo support
-- Run once in Supabase SQL editor.

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists admin_audit_log_table_idx
  on public.admin_audit_log (table_name, created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins read audit log" on public.admin_audit_log;
create policy "Admins read audit log"
  on public.admin_audit_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Trigger to capture changes on key admin-managed tables
create or replace function public.log_admin_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid;
  record_id uuid;
begin
  actor := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  record_id := coalesce((NEW).id, (OLD).id);

  if (TG_OP = 'DELETE') then
    insert into public.admin_audit_log (actor_id, action, table_name, record_id, before_data, after_data)
    values (actor, TG_OP, TG_TABLE_NAME, record_id, to_jsonb(OLD), null);
    return OLD;
  elsif (TG_OP = 'INSERT') then
    insert into public.admin_audit_log (actor_id, action, table_name, record_id, before_data, after_data)
    values (actor, TG_OP, TG_TABLE_NAME, record_id, null, to_jsonb(NEW));
    return NEW;
  else
    insert into public.admin_audit_log (actor_id, action, table_name, record_id, before_data, after_data)
    values (actor, TG_OP, TG_TABLE_NAME, record_id, to_jsonb(OLD), to_jsonb(NEW));
    return NEW;
  end if;
end;
$$;

drop trigger if exists audit_workbooks on public.workbooks;
create trigger audit_workbooks
after insert or update or delete on public.workbooks
for each row execute function public.log_admin_audit();

drop trigger if exists audit_exam_mocks on public.exam_mocks;
create trigger audit_exam_mocks
after insert or update or delete on public.exam_mocks
for each row execute function public.log_admin_audit();

drop trigger if exists audit_question_sets on public.question_sets;
create trigger audit_question_sets
after insert or update or delete on public.question_sets
for each row execute function public.log_admin_audit();


-- ==== media-library.sql ====

-- Media library (upload once, reuse everywhere)
-- Run once in Supabase SQL editor.

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text,
  file_name text,
  media_type text not null default 'image',
  bucket_id text not null default 'media',
  file_path text not null,
  file_url text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index if not exists media_assets_bucket_idx
  on public.media_assets (bucket_id);

alter table public.media_assets enable row level security;

drop policy if exists "Admins manage media assets" on public.media_assets;
create policy "Admins manage media assets"
  on public.media_assets
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

-- Storage: media bucket (public for easy reuse)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read media files" on storage.objects;
create policy "Public read media files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'media');

drop policy if exists "Admins insert media files" on storage.objects;
create policy "Admins insert media files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins update media files" on storage.objects;
create policy "Admins update media files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'media'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins delete media files" on storage.objects;
create policy "Admins delete media files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );


-- ==== workbooks.sql ====

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


-- ==== exam-resources.sql ====

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

-- ==== guides.sql ====

-- Guides + purchases schema
-- Run once in Supabase SQL editor.

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'general',
  cover_url text,
  type text not null check (type in ('pdf', 'markdown', 'video')),
  content text,
  file_path text,
  file_url text,
  price_cents integer not null default 0,
  currency text not null default 'gbp',
  stripe_price_id text,
  is_published boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Store paid content separately so public guide metadata doesn't expose it.
create table if not exists public.guide_assets (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  content text,
  file_path text,
  file_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (guide_id)
);

create table if not exists public.guide_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guide_id uuid not null references public.guides(id) on delete cascade,
  status text not null default 'paid',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_total integer,
  currency text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, guide_id)
);

alter table public.guides enable row level security;
alter table public.guide_assets enable row level security;
alter table public.guide_purchases enable row level security;

-- Backfill category for existing rows if the column was added later
alter table public.guides
  add column if not exists category text default 'general';

-- Cover image URL (public)
alter table public.guides
  add column if not exists cover_url text;

-- Public can read published guides
drop policy if exists "Public read guides" on public.guides;
create policy "Public read guides"
  on public.guides
  for select
  to public
  using (is_published = true);

-- Admins manage guides
drop policy if exists "Admins manage guides" on public.guides;
create policy "Admins manage guides"
  on public.guides
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

-- Admins manage guide assets
drop policy if exists "Admins manage guide assets" on public.guide_assets;
create policy "Admins manage guide assets"
  on public.guide_assets
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

-- Paid or subscribed users can read guide assets
drop policy if exists "Users read guide assets" on public.guide_assets;
create policy "Users read guide assets"
  on public.guide_assets
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and (p.role = 'admin' or p.is_subscribed or p.access_override)
    )
    or exists (
      select 1 from public.guide_purchases gp
      where gp.user_id = (select auth.uid())
        and gp.guide_id = guide_assets.guide_id
        and gp.status = 'paid'
    )
  );

-- Users can read their own purchases
drop policy if exists "Users read purchases" on public.guide_purchases;
create policy "Users read purchases"
  on public.guide_purchases
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Migrate existing guide content into guide_assets, then clear sensitive fields.
insert into public.guide_assets (guide_id, content, file_path, file_url)
select id, content, file_path, file_url
from public.guides
where content is not null or file_path is not null or file_url is not null
on conflict (guide_id) do update set
  content = excluded.content,
  file_path = excluded.file_path,
  file_url = excluded.file_url;

update public.guides
set content = null,
    file_path = null,
    file_url = null
where content is not null or file_path is not null or file_url is not null;

-- Dummy published guide (safe sample)
insert into public.guides (id, title, description, category, type, cover_url, price_cents, currency, is_published)
select gen_random_uuid(),
  'Starter Maths Revision Pack',
  'A short starter pack covering key number skills and quick practice.',
  'general',
  'markdown',
  '/guide-sample.svg',
  0,
  'gbp',
  true
where not exists (select 1 from public.guides where title = 'Starter Maths Revision Pack');

insert into public.guide_assets (guide_id, content)
select g.id,
  '## Starter Maths Revision Pack\n\nWelcome to your first revision pack. Use this guide to warm up before practice.\n\n### What''s inside\n- Place value refreshers\n- Four operations recap\n- Quick mixed practice\n\n### How to use\nRead each section, then try a few practice questions in the topic area.\n'
from public.guides g
where g.title = 'Starter Maths Revision Pack'
  and not exists (select 1 from public.guide_assets a where a.guide_id = g.id);

-- Dummy guide 2
insert into public.guides (id, title, description, category, type, cover_url, price_cents, currency, is_published)
select gen_random_uuid(),
  'Exam Practice Set 1',
  'Exam-style questions with worked answers and tips.',
  'general',
  'markdown',
  '/guide-sample.svg',
  0,
  'gbp',
  true
where not exists (select 1 from public.guides where title = 'Exam Practice Set 1');

insert into public.guide_assets (guide_id, content)
select g.id,
  '## Exam Practice Set 1\n\nUse this pack for timed practice. Mark your work using the notes provided.\n\n### Sections\n- 10 quick-fire questions\n- 5 longer problems\n- Answer check steps\n\n### Tip\nFocus on method marks: show your working clearly.\n'
from public.guides g
where g.title = 'Exam Practice Set 1'
  and not exists (select 1 from public.guide_assets a where a.guide_id = g.id);

-- Dummy guide 3
insert into public.guides (id, title, description, category, type, cover_url, price_cents, currency, is_published)
select gen_random_uuid(),
  'Problem Solving Booster',
  'Mixed word problems to build confidence with real-world maths.',
  'general',
  'markdown',
  '/guide-sample.svg',
  0,
  'gbp',
  true
where not exists (select 1 from public.guides where title = 'Problem Solving Booster');

insert into public.guide_assets (guide_id, content)
select g.id,
  '## Problem Solving Booster\n\nShort, structured word problems to practise choosing the right method.\n\n### What you''ll practise\n- Identifying key information\n- Selecting the correct operation\n- Checking your answer\n\n### Try this\nRead each problem twice before starting.\n'
from public.guides g
where g.title = 'Problem Solving Booster'
  and not exists (select 1 from public.guide_assets a where a.guide_id = g.id);


-- ==== guardian.sql ====

-- Guardian access links + sessions
-- Run once in Supabase SQL editor.

create table if not exists public.guardian_links (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  guardian_name text not null,
  guardian_email text not null,
  access_code_hash text not null,
  access_code_last4 text,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  verified_at timestamp with time zone,
  unique (student_id, guardian_email)
);

create index if not exists guardian_links_student_id_idx
  on public.guardian_links (student_id);

create index if not exists guardian_links_guardian_email_idx
  on public.guardian_links (guardian_email);

create table if not exists public.guardian_sessions (
  id uuid primary key default gen_random_uuid(),
  guardian_link_id uuid not null references public.guardian_links(id) on delete cascade,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null
);

create index if not exists guardian_sessions_link_id_idx
  on public.guardian_sessions (guardian_link_id);

alter table public.guardian_links enable row level security;
alter table public.guardian_sessions enable row level security;

-- Admins can manage guardian links
drop policy if exists "Admins manage guardian links" on public.guardian_links;
create policy "Admins manage guardian links"
  on public.guardian_links
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

-- Admins can manage guardian sessions
drop policy if exists "Admins manage guardian sessions" on public.guardian_sessions;
create policy "Admins manage guardian sessions"
  on public.guardian_sessions
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


-- ==== notes-flashcards.sql ====

-- Lesson notes + flashcards
-- Run once in Supabase SQL editor.

create table if not exists public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists lesson_notes_user_id_idx
  on public.lesson_notes (user_id);

create index if not exists lesson_notes_lesson_id_idx
  on public.lesson_notes (lesson_id);

alter table public.lesson_notes enable row level security;

drop policy if exists "Users read own notes" on public.lesson_notes;
create policy "Users read own notes"
  on public.lesson_notes
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users insert own notes" on public.lesson_notes;
create policy "Users insert own notes"
  on public.lesson_notes
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own notes" on public.lesson_notes;
create policy "Users update own notes"
  on public.lesson_notes
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users delete own notes" on public.lesson_notes;
create policy "Users delete own notes"
  on public.lesson_notes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  tags text,
  show_on_dashboard boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Backfill if the column was added later
alter table public.flashcards
  add column if not exists show_on_dashboard boolean not null default false;

create index if not exists flashcards_user_id_idx
  on public.flashcards (user_id);

alter table public.flashcards enable row level security;

drop policy if exists "Users read own flashcards" on public.flashcards;
create policy "Users read own flashcards"
  on public.flashcards
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users insert own flashcards" on public.flashcards;
create policy "Users insert own flashcards"
  on public.flashcards
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own flashcards" on public.flashcards;
create policy "Users update own flashcards"
  on public.flashcards
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users delete own flashcards" on public.flashcards;
create policy "Users delete own flashcards"
  on public.flashcards
  for delete
  to authenticated
  using (user_id = (select auth.uid()));


-- ==== activity-tracking.sql ====

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


-- ==== user-settings.sql ====

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


-- ==== study-plan.sql ====

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


-- ==== dashboard-widgets.sql ====

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
  using (user_id = (select auth.uid()));

drop policy if exists "Users insert own dashboard widgets" on public.user_dashboard_widgets;
create policy "Users insert own dashboard widgets"
  on public.user_dashboard_widgets
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own dashboard widgets" on public.user_dashboard_widgets;
create policy "Users update own dashboard widgets"
  on public.user_dashboard_widgets
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users delete own dashboard widgets" on public.user_dashboard_widgets;
create policy "Users delete own dashboard widgets"
  on public.user_dashboard_widgets
  for delete
  to authenticated
  using (user_id = (select auth.uid()));


-- ==== achievements.sql ====

-- Achievements and user badges
-- Run once in Supabase SQL editor.

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text,
  icon text,
  points integer not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  earned_at timestamp with time zone default now(),
  unique (user_id, achievement_id)
);

create index if not exists user_achievements_user_id_idx
  on public.user_achievements (user_id);

alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- Anyone can read available achievements
drop policy if exists "Public read achievements" on public.achievements;
create policy "Public read achievements"
  on public.achievements
  for select
  to public
  using (true);

-- Users can read their own achievements
drop policy if exists "Users read own achievements" on public.user_achievements;
create policy "Users read own achievements"
  on public.user_achievements
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Users can insert their own achievements (server-side award logic)
drop policy if exists "Users insert own achievements" on public.user_achievements;
create policy "Users insert own achievements"
  on public.user_achievements
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Seed achievements
insert into public.achievements (id, title, description, icon, points)
values
  ('first_attempt', 'First Practice', 'Complete your first practice question.', '⭐', 10),
  ('ten_attempts', 'Getting Going', 'Answer 10 practice questions.', '🔥', 20),
  ('fifty_attempts', 'Half Century', 'Answer 50 practice questions.', '🏅', 40),
  ('hundred_attempts', 'Centurion', 'Answer 100 practice questions.', '🏆', 80),
  ('first_exam', 'Exam Countdown', 'Add your first exam date.', '📅', 10)
on conflict (id) do nothing;


-- ==== progress-comments.sql ====

-- Progress comments (admin feedback on student progress)
-- Run once in Supabase SQL editor.

create table if not exists public.progress_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists progress_comments_user_id_idx
  on public.progress_comments (user_id);

alter table public.progress_comments enable row level security;

-- Admins can read/write all comments
drop policy if exists "Admins manage progress comments" on public.progress_comments;
create policy "Admins manage progress comments"
  on public.progress_comments
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

-- Students can read their own comments
drop policy if exists "Users read own progress comments" on public.progress_comments;
create policy "Users read own progress comments"
  on public.progress_comments
  for select
  to authenticated
  using (user_id = (select auth.uid()));


-- ==== support-chat.sql ====

-- In-house support chat (student <-> admin)
-- Run once in Supabase SQL editor.

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete cascade,
  subject text,
  last_message_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists support_conversations_student_id_idx
  on public.support_conversations (student_id);

create index if not exists support_conversations_admin_id_idx
  on public.support_conversations (admin_id);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index if not exists support_messages_conversation_id_idx
  on public.support_messages (conversation_id);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

-- Participants can read conversations
drop policy if exists "Participants read conversations" on public.support_conversations;
create policy "Participants read conversations"
  on public.support_conversations
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or admin_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Admins can create conversations
drop policy if exists "Admins create conversations" on public.support_conversations;
create policy "Admins create conversations"
  on public.support_conversations
  for insert
  to authenticated
  with check (
    admin_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Students can create conversations (admin must be valid)
drop policy if exists "Students create conversations" on public.support_conversations;
create policy "Students create conversations"
  on public.support_conversations
  for insert
  to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = admin_id and p.role = 'admin'
    )
  );

-- Participants can update conversations (e.g. last_message_at)
drop policy if exists "Participants update conversations" on public.support_conversations;
create policy "Participants update conversations"
  on public.support_conversations
  for update
  to authenticated
  using (
    student_id = (select auth.uid())
    or admin_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    student_id = (select auth.uid())
    or admin_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Participants can read messages
drop policy if exists "Participants read messages" on public.support_messages;
create policy "Participants read messages"
  on public.support_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id
        and (c.student_id = (select auth.uid()) or c.admin_id = (select auth.uid()))
    )
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Participants can send messages
drop policy if exists "Participants send messages" on public.support_messages;
create policy "Participants send messages"
  on public.support_messages
  for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id
        and (c.student_id = (select auth.uid()) or c.admin_id = (select auth.uid()))
    )
  );

-- Participants can update messages (e.g. read_at)
drop policy if exists "Participants update messages" on public.support_messages;
create policy "Participants update messages"
  on public.support_messages
  for update
  to authenticated
  using (
    exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id
        and (c.student_id = (select auth.uid()) or c.admin_id = (select auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id
        and (c.student_id = (select auth.uid()) or c.admin_id = (select auth.uid()))
    )
  );


-- ==== perf-fixes.sql ====

-- Performance: add missing FK indexes flagged by Supabase lints.
-- Requires base schema tables (attempts/questions/lessons/topics) to exist.

create index if not exists admin_audit_log_actor_id_idx
  on public.admin_audit_log (actor_id);

create index if not exists attempts_question_id_idx
  on public.attempts (question_id);

create index if not exists attempts_selected_option_id_idx
  on public.attempts (selected_option_id);

create index if not exists guide_purchases_guide_id_idx
  on public.guide_purchases (guide_id);

create index if not exists lessons_topic_id_idx
  on public.lessons (topic_id);

create index if not exists media_assets_created_by_idx
  on public.media_assets (created_by);

create index if not exists progress_comments_admin_id_idx
  on public.progress_comments (admin_id);

create index if not exists question_options_question_id_idx
  on public.question_options (question_id);

create index if not exists questions_lesson_id_idx
  on public.questions (lesson_id);

create index if not exists support_messages_sender_id_idx
  on public.support_messages (sender_id);

create index if not exists topics_level_id_idx
  on public.topics (level_id);

create index if not exists topics_subject_id_idx
  on public.topics (subject_id);

create index if not exists user_achievements_achievement_id_idx
  on public.user_achievements (achievement_id);

create index if not exists workbook_versions_created_by_idx
  on public.workbook_versions (created_by);
