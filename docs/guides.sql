-- Guides + purchases schema
-- Run once in Supabase SQL editor.

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
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
alter table public.guide_purchases enable row level security;

-- Public can read published guides
create policy "Public read guides"
  on public.guides
  for select
  to public
  using (is_published = true);

-- Admins manage guides
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

-- Users can read their own purchases
create policy "Users read purchases"
  on public.guide_purchases
  for select
  to authenticated
  using (user_id = auth.uid());
