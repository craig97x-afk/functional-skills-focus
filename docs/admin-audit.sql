-- Admin audit log + undo support
-- Run once in Supabase SQL editor.

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists admin_audit_log_table_idx
  on public.admin_audit_log (table_name, created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins read audit log" on public.admin_audit_log;
create policy "Admins read audit log"
  on public.admin_audit_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Trigger to capture changes on key admin-managed tables
create or replace function public.log_admin_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid;
  record_id uuid;
begin
  actor := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  record_id := coalesce((NEW).id, (OLD).id);

  if (TG_OP = 'DELETE') then
    insert into public.admin_audit_log (actor_id, action, table_name, record_id, before_data, after_data)
    values (actor, TG_OP, TG_TABLE_NAME, record_id, to_jsonb(OLD), null);
    return OLD;
  elsif (TG_OP = 'INSERT') then
    insert into public.admin_audit_log (actor_id, action, table_name, record_id, before_data, after_data)
    values (actor, TG_OP, TG_TABLE_NAME, record_id, null, to_jsonb(NEW));
    return NEW;
  else
    insert into public.admin_audit_log (actor_id, action, table_name, record_id, before_data, after_data)
    values (actor, TG_OP, TG_TABLE_NAME, record_id, to_jsonb(OLD), to_jsonb(NEW));
    return NEW;
  end if;
end;
$$;

drop trigger if exists audit_workbooks on public.workbooks;
create trigger audit_workbooks
after insert or update or delete on public.workbooks
for each row execute function public.log_admin_audit();

drop trigger if exists audit_exam_mocks on public.exam_mocks;
create trigger audit_exam_mocks
after insert or update or delete on public.exam_mocks
for each row execute function public.log_admin_audit();

drop trigger if exists audit_question_sets on public.question_sets;
create trigger audit_question_sets
after insert or update or delete on public.question_sets
for each row execute function public.log_admin_audit();
