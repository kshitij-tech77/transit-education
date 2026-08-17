/**
 * CMS-wide constants. Single source of truth for section names, API paths,
 * status enums, category lists, and option sets used across the CMS portal.
 *
 * HOW TO USE:
 *  - Section/modal routing  → CMS_API_PATH[key]
 *  - Status badge colors    → CONTENT_STATUS or STUDENT_STATUS values
 *  - Filter/select options  → FAQ_CATEGORIES, FAQ_PAGES, JOB_TYPES, etc.
 */

// ─── Sidebar Section Names ────────────────────────────────────────────────────

export const CMS_SECTIONS = [
  "Dashboard",
  "Students",
  "Blog Posts",
  "FAQ Manager",
  "Country Pages",
  "Success Stories",
  "Resources",
  "Media Library",
  "Testimonials",
  "Team",
  "Branches",
  "Settings",
  "Events",
  "Careers",
  "Franchise Inquiries",
  "Loyalty",
] as const;

export type CmsSection = (typeof CMS_SECTIONS)[number];

// ─── Modal Keys ───────────────────────────────────────────────────────────────
// These match the string values stored in Portal.tsx's `showModal` state.

export const CMS_MODAL_KEYS = [
  "Student",
  "Blog",
  "Story",
  "FAQ",
  "Testimonial",
  "Branch",
  "Resource",
  "Event",
  "JobOpening",
  "LoyaltyReward",
  "LoyaltyMilestone",
  "TeamMember",
] as const;

export type CmsModalKey = (typeof CMS_MODAL_KEYS)[number];

// ─── Section / Modal Key → API Path Map ──────────────────────────────────────
// Unified map covering:
//   • Modal keys (what showModal state holds)
//   • Section names passed to handleSave / handleDelete
//   • Internal section keys passed directly as strings
//
// Fixes the pre-existing divergence between handleSave (.replace(/ /g, "-"))
// and handleDelete (.replace(" ", "-")), which silently broke "Success Stories".

export const CMS_API_PATH: Readonly<Record<string, string>> = {
  // Modal keys
  Student: "students",
  Blog: "blog",
  Story: "success-stories",
  FAQ: "faqs",
  Testimonial: "testimonials",
  Branch: "branches",
  Resource: "resources",
  Event: "events",
  JobOpening: "job-openings",
  JobApplication: "job-applications",
  FranchiseInquiry: "franchise-inquiries",
  LoyaltyReward: "loyalty/rewards",
  LoyaltyRedemption: "loyalty/redemptions",
  LoyaltyMilestone: "loyalty/milestones",
  LoyaltyCompletion: "loyalty/completions",
  TeamMember: "team-members",

  // Section name aliases (for direct section-level saves/deletes)
  "Blog Posts": "blog",
  "Country Pages": "countries",
  "FAQ Manager": "faqs",
  "Success Stories": "success-stories",
  "Franchise Inquiries": "franchise-inquiries",
  "Team": "team-members",

  // Lowercase passthrough keys (already-resolved values)
  students: "students",
  blog: "blog",
  faqs: "faqs",
  countries: "countries",
  "success-stories": "success-stories",
  resources: "resources",
  branches: "branches",
  testimonials: "testimonials",
  "team-members": "team-members",
  events: "events",
  "job-openings": "job-openings",
  "job-applications": "job-applications",
  "franchise-inquiries": "franchise-inquiries",
  settings: "settings",
  media: "media",
  "loyalty/rewards": "loyalty/rewards",
  "loyalty/redemptions": "loyalty/redemptions",
  "loyalty/milestones": "loyalty/milestones",
  "loyalty/completions": "loyalty/completions",
} as const;

// ─── Student Statuses ─────────────────────────────────────────────────────────
// Ground truth: AdminStudentSchema in /api/cms/students/route.ts

export const STUDENT_STATUS = {
  PENDING: "PENDING",
  CONTACTED: "CONTACTED",
  ENROLLED: "ENROLLED",
  REJECTED: "REJECTED",
  APPROVED: "APPROVED",
  NOT_INTERESTED: "NOT_INTERESTED",
} as const;

export type StudentStatus = (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

// ─── Generic Content Statuses ─────────────────────────────────────────────────
// Used for countries (LIVE/DRAFT), blog (PUBLISHED/DRAFT), FAQs, events.

export const CONTENT_STATUS = {
  LIVE: "LIVE",
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  IN_PROGRESS: "IN PROGRESS",
} as const;

export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

export const COUNTRY_STATUS = ["LIVE", "DRAFT"] as const;
export type CountryStatus = (typeof COUNTRY_STATUS)[number];

export const BLOG_STATUS = ["PUBLISHED", "DRAFT"] as const;
export type BlogStatus = (typeof BLOG_STATUS)[number];

export const FAQ_STATUS = ["Published", "Draft"] as const;
export type FaqStatus = (typeof FAQ_STATUS)[number];

// ─── FAQ Categories ───────────────────────────────────────────────────────────
// Single source — used in filter dropdowns AND add/edit modals.

export const FAQ_CATEGORIES = [
  "General",
  "Canada",
  "Australia",
  "UK",
  "USA",
  "Germany",
  "New Zealand",
  "Japan",
  "South Korea",
  "Ireland",
  "Italy",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

// ─── FAQ Page Paths ───────────────────────────────────────────────────────────
// Static pages. Country pages are appended dynamically from data.countries.

export const FAQ_STATIC_PAGES = [
  "Homepage",
  "Blog",
  "About",
  "Contact",
  "Services",
] as const;

export type FaqStaticPage = (typeof FAQ_STATIC_PAGES)[number];
export type FaqPagePath = FaqStaticPage | `study-abroad/${string}`;

// ─── Job & Resource Options ───────────────────────────────────────────────────

export const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const RESOURCE_CATEGORIES = [
  "Visa Documents",
  "Official Links",
  "Test Prep Materials",
] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_TYPES = ["PDF", "External", "DOCX"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

// ─── Franchise Inquiry Statuses ───────────────────────────────────────────────

export const FRANCHISE_STATUSES = ["new", "contacted", "in_progress", "closed"] as const;
export type FranchiseStatus = (typeof FRANCHISE_STATUSES)[number];

// ─── Loyalty Redemption Statuses ──────────────────────────────────────────────
// Ground truth: loyalty_redemptions.status check constraint (migration
// 20260707120000_loyalty_program.sql). PENDING is set by the loyalty_redeem()
// RPC; FULFILLED/REJECTED are staff-only transitions via the CMS.

export const LOYALTY_REDEMPTION_STATUSES = ["PENDING", "FULFILLED", "REJECTED"] as const;
export type LoyaltyRedemptionStatus = (typeof LOYALTY_REDEMPTION_STATUSES)[number];

// ─── Loyalty Milestone Completion Statuses ────────────────────────────────────
// Ground truth: loyalty_milestone_completions.status check constraint
// (migration 004_loyalty_milestones.sql). PENDING is set by the student's
// claim; APPROVED/REJECTED are staff-only transitions via the CMS.

export const LOYALTY_COMPLETION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type LoyaltyCompletionStatus = (typeof LOYALTY_COMPLETION_STATUSES)[number];
