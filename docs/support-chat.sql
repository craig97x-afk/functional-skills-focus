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
    student_id = auth.uid()
    or admin_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admins can create conversations
drop policy if exists "Admins create conversations" on public.support_conversations;
create policy "Admins create conversations"
  on public.support_conversations
  for insert
  to authenticated
  with check (
    admin_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Students can create conversations (admin must be valid)
drop policy if exists "Students create conversations" on public.support_conversations;
create policy "Students create conversations"
  on public.support_conversations
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
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
    student_id = auth.uid()
    or admin_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    student_id = auth.uid()
    or admin_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
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
        and (c.student_id = auth.uid() or c.admin_id = auth.uid())
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Participants can send messages
drop policy if exists "Participants send messages" on public.support_messages;
create policy "Participants send messages"
  on public.support_messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id
        and (c.student_id = auth.uid() or c.admin_id = auth.uid())
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
        and (c.student_id = auth.uid() or c.admin_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id
        and (c.student_id = auth.uid() or c.admin_id = auth.uid())
    )
  );
