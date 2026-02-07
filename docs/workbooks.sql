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
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists workbooks_subject_level_idx
  on public.workbooks (subject, level_slug);

create index if not exists workbooks_topic_idx
  on public.workbooks (topic);

alter table public.workbooks enable row level security;

-- Public can read published workbooks
drop policy if exists "Public read workbooks" on public.workbooks;
create policy "Public read workbooks"
  on public.workbooks
  for select
  to public
  using (is_published = true);

-- Admins manage workbooks
drop policy if exists "Admins manage workbooks" on public.workbooks;
create policy "Admins manage workbooks"
  on public.workbooks
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
      where p.id = auth.uid() and p.role = 'admin'
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
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'workbooks'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
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
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
