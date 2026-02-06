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
  using (user_id = auth.uid());

drop policy if exists "Users insert own notes" on public.lesson_notes;
create policy "Users insert own notes"
  on public.lesson_notes
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users update own notes" on public.lesson_notes;
create policy "Users update own notes"
  on public.lesson_notes
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users delete own notes" on public.lesson_notes;
create policy "Users delete own notes"
  on public.lesson_notes
  for delete
  to authenticated
  using (user_id = auth.uid());

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  tags text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists flashcards_user_id_idx
  on public.flashcards (user_id);

alter table public.flashcards enable row level security;

drop policy if exists "Users read own flashcards" on public.flashcards;
create policy "Users read own flashcards"
  on public.flashcards
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users insert own flashcards" on public.flashcards;
create policy "Users insert own flashcards"
  on public.flashcards
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users update own flashcards" on public.flashcards;
create policy "Users update own flashcards"
  on public.flashcards
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users delete own flashcards" on public.flashcards;
create policy "Users delete own flashcards"
  on public.flashcards
  for delete
  to authenticated
  using (user_id = auth.uid());
