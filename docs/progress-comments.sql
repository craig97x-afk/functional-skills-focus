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
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Students can read their own comments
drop policy if exists "Users read own progress comments" on public.progress_comments;
create policy "Users read own progress comments"
  on public.progress_comments
  for select
  to authenticated
  using (user_id = auth.uid());
