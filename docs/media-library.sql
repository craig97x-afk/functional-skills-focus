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
