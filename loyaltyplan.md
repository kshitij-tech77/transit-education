# Student Loyalty Portal — Milestone Journey System

## Context

The CEO wants the loyalty portal to reflect a student's entire study-abroad journey (first counselling session → IELTS prep → visa → flight → arrival → alumni), earning points at each real-world milestone, rolling up into tiers (Bronze/Silver/Gold/Platinum) that gate bigger rewards, with bonus points flowing to referrers when the people they refer hit milestones of their own.

The current implementation only has a flat "redeem points from a catalog" system:
- `loyalty_members` (id, referral_code, referred_by_member_id, points_balance)
- `loyalty_rewards` (title, points_cost, stock, active) — admin CRUD already exists
- `loyalty_redemptions` (PENDING/FULFILLED/REJECTED) — admin approve/reject already exists
- `loyalty_transactions` ledger (only `type='EARN'` ever inserted, reason codes `'REFERRAL_SIGNUP'` and `'REDEMPTION'`)

There is no concept of milestones, a journey, tiers, or a staff-verification queue for anything other than reward redemptions. This plan adds that engine, reusing the existing patterns rather than inventing new ones.

**Confirmed with user:**
1. Multi-stage referral crediting — referrer earns bonus points when their referred friend completes *specific* later milestones, not just at signup.
2. Completion flow — student self-reports a milestone as done → pending queue → staff approves/rejects (mirrors the existing redemption PENDING→FULFILLED/REJECTED pattern) → points credited only on approval.
3. Reward tiers gate access — a reward can require a minimum tier (computed from lifetime earned points) in addition to its points cost.

**Important discovery:** there is already a full CMS admin section for loyalty — `src/components/cms/sections/LoyaltySection.tsx`, wired into the sidebar (`src/components/cms/Portal.tsx`, "Loyalty" nav item with a pending-count badge) with Rewards/Redemptions/Members tabs, built on shared components (`CmsCard`, `CmsButton`, `CmsModal`, `FormField`) and data plumbing (`useCmsData.ts`, `useCmsActions.ts`, `CMS_API_PATH`/`CMS_SECTIONS`/`CMS_MODAL_KEYS` in `src/constants/cms.ts`). This work **extends** that existing machinery — it does not build a new admin page from scratch.

---

## 1. New DB migration — `supabase/migrations/004_loyalty_milestones.sql`

Existing loyalty tables aren't tracked as migrations in this repo (created out-of-band via the Supabase SQL editor), but this new work should follow the numbered-migration convention already used for `001`–`003`. **Before running this, manually confirm in the Supabase dashboard how the existing `loyalty_redeem` RPC affects `loyalty_members` columns** — its SQL body isn't in this repo, so we can't verify from source whether it touches anything beyond `points_balance`. Since `lifetime_points_earned` is a brand-new column, the RPC can't be touching it yet, but confirm no unrelated trigger will.

```sql
-- Milestone catalog (admin-managed, dynamic — staff add/reorder via CMS)
create table loyalty_milestones (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,               -- e.g. 'counselling' | 'exam' | 'visa' | 'travel' | 'alumni' | 'referral' — optional UI grouping
  icon text,                   -- emoji or lucide icon name
  points int not null check (points > 0),
  referrer_bonus_points int,   -- if set: referrer gets this many points when a referred member's completion of THIS milestone is approved
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Student claims against a milestone
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

-- Prevent duplicate active claims for the same milestone (a REJECTED claim can be resubmitted)
create unique index loyalty_milestone_completions_active_unique
  on loyalty_milestone_completions (member_id, milestone_id)
  where status in ('PENDING', 'APPROVED');

-- Tier gating on rewards
alter table loyalty_rewards
  add column min_tier text check (min_tier in ('BRONZE','SILVER','GOLD','PLATINUM'));

-- Lifetime earned points, distinct from spendable points_balance (which drops on redemption).
-- Tier is always computed from this column, never from points_balance, so redeeming never demotes a student.
alter table loyalty_members
  add column lifetime_points_earned int not null default 0;
```

**Tier thresholds are NOT a new table.** This codebase consistently favors small inline constants over abstraction for things that don't change often (`loyalty.ts` is 17 lines, `REFERRAL_SIGNUP_POINTS` is a bare constant, no enums exist anywhere yet). Tier boundaries are a business-logic constant staff would tune rarely (via a code change), unlike milestones/rewards which change often (hence those get DB + CMS). New file `src/lib/loyalty-tiers.ts`:

```ts
export const LOYALTY_TIERS = [
  { tier: 'PLATINUM', minPoints: 46 },
  { tier: 'GOLD',      minPoints: 26 },
  { tier: 'SILVER',    minPoints: 11 },
  { tier: 'BRONZE',    minPoints: 0 },
] as const;

export type LoyaltyTier = typeof LOYALTY_TIERS[number]['tier'];

export function tierForPoints(points: number): LoyaltyTier {
  return LOYALTY_TIERS.find(t => points >= t.minPoints)!.tier;
}

export function tierRank(tier: LoyaltyTier): number {
  return LOYALTY_TIERS.findIndex(t => t.tier === tier);
}
```
(Thresholds above are placeholders inspired by the CEO's sample — flag explicitly that he should confirm final numbers, don't treat as settled.)

New reason codes to introduce (no enum exists yet in this codebase — these are the first ones, follow the existing inline-string-literal convention seen in `register/route.ts` and `redemptions/[id]/route.ts`): `'MILESTONE_COMPLETED'`, `'REFERRAL_MILESTONE_BONUS'`.

---

## 2. New/changed API routes

**Admin — new files, following the exact Zod + `createClient()` auth-check + `supabaseAdmin` pattern already used in `src/app/api/cms/loyalty/rewards/route.ts` and `redemptions/[id]/route.ts`:**

- `src/app/api/cms/loyalty/milestones/route.ts` — GET (list all, ordered by `sort_order`), POST (create)
- `src/app/api/cms/loyalty/milestones/[id]/route.ts` — PUT (update), DELETE
- `src/app/api/cms/loyalty/completions/route.ts` — GET, joining milestone title + member email (reuse `getUserEmailMap()` from `src/lib/loyalty-admin.ts`, same as `redemptions/route.ts` does)
- `src/app/api/cms/loyalty/completions/[id]/route.ts` — PUT, body `{status: 'APPROVED'|'REJECTED', notes?}`, mirroring `redemptions/[id]/route.ts`'s guard-against-PENDING-only logic:
  - Fetch the completion, 404 if missing, 400 if not currently PENDING (same double-processing guard as redemptions)
  - **On APPROVED:** insert a `loyalty_transactions` EARN row (`reason_code: 'MILESTONE_COMPLETED'`, `points: milestone.points`), increment that member's `points_balance` and `lifetime_points_earned` by `milestone.points`. Then check `member.referred_by_member_id` — if set AND `milestone.referrer_bonus_points` is set, insert a second EARN row for the referrer (`reason_code: 'REFERRAL_MILESTONE_BONUS'`, `related_member_id: member.id`) and bump the referrer's `points_balance`/`lifetime_points_earned` too.
  - **On REJECTED:** just update `status`/`notes` — no point reversal needed (unlike redemption rejection, nothing was deducted at claim time here, since credit only happens on approval).
  - Set `reviewed_at = now()`, `reviewed_by = user.id`.

**Student-facing — new file:**
- `src/app/api/portal/milestones/claim/route.ts` — POST `{milestoneId}`, same auth pattern as `src/app/api/portal/register/route.ts` (`createClient()` + `getUser()`, 401 if absent), inserts a PENDING `loyalty_milestone_completions` row. Return a clear 409-style error if the partial unique index rejects it (claim already pending/approved).

---

## 3. CMS admin UI changes (extend, do not rebuild)

- **`src/components/cms/sections/LoyaltySection.tsx`**: add two tabs to the existing tab bar:
  - **"Milestones"** — CRUD table (title, points, referrer bonus, category, active, sort order) + a `CmsModal` create/edit form using `FormField`/`CMS_INPUT_CLS` exactly like the existing Rewards tab's modal.
  - **"Claims"** — table (student email, milestone title, submitted date, `StatusBadge`, Approve/Reject `CmsButton`s shown only when `status === 'PENDING'`) — same shape as the existing Redemptions tab.
- **`src/hooks/useCmsData.ts`**: add `loyaltyMilestones → /api/cms/loyalty/milestones` and `loyaltyCompletions → /api/cms/loyalty/completions` to the `ENDPOINTS` array.
- **`src/constants/cms.ts`**:
  - `CMS_API_PATH`: add `LoyaltyMilestone: "loyalty/milestones"`, `LoyaltyCompletion: "loyalty/completions"`
  - `CmsModalKey`/`CMS_MODAL_KEYS`: add `"LoyaltyMilestone"` (Claims tab needs no create/edit modal, just inline approve/reject, like Redemptions)
- **`src/components/cms/Portal.tsx`** sidebar badge (`sidebarGroups`, "Loyalty" item): currently `data.loyaltyRedemptions.filter(r => r.status === "PENDING").length` — change to also add pending milestone completions, so the badge reflects *all* outstanding staff action items.

---

## 4. Student dashboard changes — `src/app/(portal)/portal/dashboard/page.tsx`

- `load()`: also fetch active `loyalty_milestones` (ordered by `sort_order`) and the member's own `loyalty_milestone_completions`, to know per-milestone status (not started / PENDING / APPROVED / REJECTED).
- Compute tier client-side: `tierForPoints(member.lifetime_points_earned)` from the new `src/lib/loyalty-tiers.ts`.
- New **"Your Journey"** section: milestone list/cards (icon + title + points + status pill), with a "Mark as done" button on not-started milestones that POSTs to `/api/portal/milestones/claim` and reloads. Keep existing visual language — bracket font sizes (`text-[13.5px]` etc.), `rounded-2xl` white cards with `border-[#E5E4E0]`, `bg-brand`/icons from `lucide-react`.
- Tier badge next to the points-balance hero card (e.g. "🥈 Silver").
- Reward gating: alongside the existing `canAfford` check, add `tierMet = !r.minTier || tierRank(currentTier) >= tierRank(r.minTier)`; disable with a "Reach {tier} to unlock" label when not met, in the same card/button structure already used.

---

## 5. Phasing recommendation

**Phase 1 (core engine):** migration + milestone CRUD (admin) + claim/approve/reject loop (student + admin) + dashboard journey list. Seed with a **handful** of real milestones staff enter themselves through the new admin UI — do not hardcode the CEO's full ~20-row sample in a seed migration, since he was explicit that it's inspiration, not a spec. This alone proves the real mechanic end-to-end.

**Phase 2:** tier computation + tier-gated rewards (`min_tier` column, dashboard tier badge, reward-gating check).

**Phase 3:** multi-stage referral bonus crediting (`referrer_bonus_points` + the crediting branch in the approve route). Technically small enough to ship with Phase 1, but sequencing it after the core loop is proven avoids tangling referral-chain bugs with basic approve/reject debugging.

**Explicitly deferred (not v1):**
- "Grand rewards" for full-journey completion (needs an "all required milestones done" check — no urgency)
- Cash-reward payout/accounting integration — the system only needs to record that a cash-reward milestone was approved; actual NPR disbursement stays an offline/manual staff process, no payment gateway work
- Bonus milestones like "3/5/10 referrals" or "Google review" — once Phase 1 ships, these are just more admin-entered rows in the same engine, no new engineering needed

---

## Verification

1. Apply the migration (confirm with the user how migrations 001–003 were actually deployed — likely pasted into the Supabase SQL editor manually given no `config.toml`/CLI linkage exists — and follow the same method).
2. Manually check the `loyalty_redeem` RPC in the Supabase dashboard before relying on `lifetime_points_earned` math, to confirm nothing unexpected touches it.
3. End-to-end test: as staff, create 2–3 milestones in the new admin tab → as a student, log in and see them on the dashboard, claim one → as staff, see it in the Claims tab, approve it → confirm the student's `points_balance` and `lifetime_points_earned` increase and their tier updates.
4. Test referral bonus: have a referred student complete a milestone with `referrer_bonus_points` set, confirm the referrer's balance increases too.
5. Test reward gating: set a reward's `min_tier` above the current student's tier, confirm it's disabled with the "Reach {tier}" message; lower it and confirm it becomes redeemable.
