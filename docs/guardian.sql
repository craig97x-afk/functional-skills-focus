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
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
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
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
