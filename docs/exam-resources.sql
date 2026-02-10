-- Exam mocks + question banks (resources by level)
-- Run once in Supabase SQL editor.

create table if not exists public.exam_mocks (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  title text not null,
  description text,
  cover_url text,
  file_path text,
  file_url text,
  is_published boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.question_sets (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  title text not null,
  description text,
  cover_url text,
  resource_url text,
  is_published boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists exam_mocks_subject_level_idx
  on public.exam_mocks (subject, level_slug);

create index if not exists question_sets_subject_level_idx
  on public.question_sets (subject, level_slug);

alter table public.exam_mocks enable row level security;
alter table public.question_sets enable row level security;

-- Public can read published mocks and question sets
drop policy if exists "Public read exam mocks" on public.exam_mocks;
create policy "Public read exam mocks"
  on public.exam_mocks
  for select
  to public
  using (is_published = true);

drop policy if exists "Public read question sets" on public.question_sets;
create policy "Public read question sets"
  on public.question_sets
  for select
  to public
  using (is_published = true);

-- Admins manage mocks and question sets
drop policy if exists "Admins manage exam mocks" on public.exam_mocks;
create policy "Admins manage exam mocks"
  on public.exam_mocks
  for all
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

drop policy if exists "Admins manage question sets" on public.question_sets;
create policy "Admins manage question sets"
  on public.question_sets
  for all
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
      where p.id = auth.uid() and p.role = 'admin'
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
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
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
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
