-- Safe re-application of migration 004 (loyalty milestone journey system),
-- which was written but never actually applied to production. Verified via
-- live schema introspection on 2026-07-13: loyalty_milestones and
-- loyalty_milestone_completions do not exist, and loyalty_members /
-- loyalty_rewards are missing lifetime_points_earned / min_tier.
--
-- This migration only adds objects that are genuinely missing. It does not
-- touch any table, column, trigger, index, or RLS policy that already
-- exists in production (loyalty_members, loyalty_rewards, loyalty_redemptions,
-- loyalty_transactions, loyalty_redeem(), loyalty_apply_transaction(), or
-- their existing triggers/policies are left untouched). Every statement is
-- guarded so this is safe to run even if some subset of 004 was applied out
-- of band.

create table if not exists loyalty_milestones (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  icon text,
  points int not null check (points > 0),
  referrer_bonus_points int,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists loyalty_milestone_completions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references loyalty_members(id),
  milestone_id uuid not null references loyalty_milestones(id),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz not null default now()
);

-- A student can't have two active (pending or approved) claims for the same
-- milestone at once, but a rejected claim can be resubmitted.
create unique index if not exists loyalty_milestone_completions_active_unique
  on loyalty_milestone_completions (member_id, milestone_id)
  where status in ('PENDING', 'APPROVED');

alter table loyalty_rewards
  add column if not exists min_tier text check (min_tier in ('BRONZE','SILVER','GOLD','PLATINUM'));

alter table loyalty_members
  add column if not exists lifetime_points_earned integer default 0 not null;

-- RLS posture matches the four existing loyalty_* tables exactly: one SELECT
-- policy each, no explicit write policies. All writes to loyalty tables in
-- this codebase go through the service-role client (supabaseAdmin) or a
-- SECURITY DEFINER RPC, both of which bypass RLS already, so an explicit
-- service-role write policy would be redundant with every other loyalty
-- table's posture (see "members select own", "rewards select active",
-- "redemptions select own", "transactions select own" in schema.sql).
alter table loyalty_milestones enable row level security;
alter table loyalty_milestone_completions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'loyalty_milestones' and policyname = 'milestones select active'
  ) then
    create policy "milestones select active" on loyalty_milestones
      for select using (active = true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'loyalty_milestone_completions' and policyname = 'completions select own'
  ) then
    create policy "completions select own" on loyalty_milestone_completions
      for select using (auth.uid() = member_id);
  end if;
end $$;
