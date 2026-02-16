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
