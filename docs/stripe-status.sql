-- Add Stripe status tracking columns on profiles
alter table public.profiles
  add column if not exists stripe_status text,
  add column if not exists stripe_status_updated_at timestamp with time zone;

comment on column public.profiles.stripe_status
  is 'Raw Stripe subscription status (active, trialing, past_due, canceled, etc).';

comment on column public.profiles.stripe_status_updated_at
  is 'Last time Stripe status was updated via webhook or admin resync.';
