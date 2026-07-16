-- Milestone journey system for the student loyalty portal.
-- Adds a staff-managed milestone catalog, student self-report + staff-verify
-- claims, tier-gating on rewards, and a lifetime-earned points counter
-- (distinct from points_balance, which drops on redemption) so a student's
-- tier never regresses after they redeem a reward.

create table loyalty_milestones (
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

create table loyalty_milestone_completions (
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
create unique index loyalty_milestone_completions_active_unique
  on loyalty_milestone_completions (member_id, milestone_id)
  where status in ('PENDING', 'APPROVED');

alter table loyalty_rewards
  add column min_tier text check (min_tier in ('BRONZE','SILVER','GOLD','PLATINUM'));

alter table loyalty_members
  add column lifetime_points_earned int not null default 0;
