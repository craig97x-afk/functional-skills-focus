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
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
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
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
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
      where p.id = auth.uid()
        and (p.role = 'admin' or p.is_subscribed or p.access_override)
    )
    or exists (
      select 1 from public.guide_purchases gp
      where gp.user_id = auth.uid()
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
  using (user_id = auth.uid());

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
