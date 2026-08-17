/**
 * CMS entity type definitions.
 *
 * All shapes here match the actual API response payloads (the transformed /
 * camelCased forms returned by /api/cms/* route handlers), NOT raw Supabase
 * DB row shapes.
 *
 * Kept separate from src/lib/types/blog.ts which covers the public-facing
 * blog post type (richer SEO / EEAT fields). The BlogPost type here is the
 * slimmer CMS list-view representation.
 */

import type {
  StudentStatus,
  CountryStatus,
  BlogStatus,
  FaqStatus,
  JobType,
  ResourceCategory,
  ResourceType,
  FranchiseStatus,
  FaqCategory,
  FaqPagePath,
  LoyaltyRedemptionStatus,
  LoyaltyCompletionStatus,
} from "@/constants/cms";

// ─── Auth / Profile ───────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
}

// ─── Students ─────────────────────────────────────────────────────────────────
// Shape: /api/cms/students GET transform

export interface Student {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  /** Resolved branch name (not branch_id). */
  branch: string;
  /** Resolved country name (not country_id). */
  country: string;
  counselor: string | null;
  status: StudentStatus;
  notes: string | null;
  date: string | null;
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────
// Slim CMS list-view shape. Full shape lives in src/lib/types/blog.ts.

export interface CmsBlogPost {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  /** API may return as `author` or `authorName` — both kept optional. */
  author: string | null;
  authorName: string | null;
  status: BlogStatus;
  /** API may return as `date` or `publishDate`. */
  date: string | null;
  publishDate: string | null;
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────
// Shape: /api/cms/faqs GET transform (page = page_path, featured = is_featured,
// order = display_order, status is Title-cased by the route handler)

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory | string;
  /** Page path where this FAQ appears (transformed from page_path in DB). */
  page: FaqPagePath | string;
  featured: boolean;
  order: number;
  status: FaqStatus;
  createdAt: string | null;
}

// ─── Countries ────────────────────────────────────────────────────────────────
// Shape: /api/cms/countries GET transform

export interface VisaStep {
  title: string;
  text: string;
}

export interface EntryRequirements {
  ug: string[];
  pg: string[];
}

export interface Country {
  id: string;
  code: string;
  flag: string;
  name: string;
  status: CountryStatus;
  heroTitle: string | null;
  whyStudy: string | null;
  entryRequirements: EntryRequirements;
  visaProcess: VisaStep[];
  intakes: string | null;
  visaTime: string | null;
  /** Mapped from DB tuition_range. */
  tuition: string | null;
  /** Comma-separated list (mapped from top_universities string[]). */
  universities: string;
  requiredDocuments: string[];
  majorIntakesDescription: string;
  metaTitle: string;
  metaDescription: string;
  costOfLiving: unknown | null;
  scholarshipData: unknown | null;
  cityGuides: unknown | null;
  universityList: unknown | null;
  visaExtended: unknown | null;
  lastEdited: string | null;
}

/**
 * Transient editing shape for the Country editor form.
 * JSON sub-page fields are serialized to strings for textarea editing.
 */
export interface CountryEditState extends Omit<
  Country,
  "costOfLiving" | "scholarshipData" | "cityGuides" | "universityList" | "visaExtended"
> {
  costOfLiving: string;
  scholarshipData: string;
  cityGuides: string;
  universityList: string;
  visaExtended: string;
}

// ─── Success Stories ──────────────────────────────────────────────────────────
// Shape: /api/cms/success-stories GET transform

export interface SuccessStory {
  id: string;
  name: string;
  country: string;
  flag: string;
  university: string;
  year: string | null;
  course: string | null;
  approvalImage: string;
}

// ─── Resources ────────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory | string | null;
  type: ResourceType | string | null;
  url: string | null;
  file_size: string | null;
  display_order: number;
  status: string | null;
}

// ─── Branches ─────────────────────────────────────────────────────────────────
// Shape: /api/cms/branches GET transform

export interface Branch {
  id: string;
  name: string;
  /** Mapped from DB address column. */
  addr: string | null;
  phone: string | null;
  /** Mapped from DB manager_name column. */
  mgr: string | null;
  /** Mapped from DB working_hours column. */
  hours: string | null;
  count: number;
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  university: string | null;
  course: string | null;
  country: string | null;
  body: string | null;
  rating: number;
  photo: string | null;
}

// ─── Team ─────────────────────────────────────────────────────────────────────
// Shape: /api/cms/team-members GET transform

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  branchId: string | null;
  /** Resolved branch name (not branch_id). */
  branch: string | null;
  photo: string | null;
  displayOrder: number;
  isVisible: boolean;
}

// ─── Site Settings ────────────────────────────────────────────────────────────
// Shape: /api/cms/settings GET response + CEO fields stored in site_settings.
// All fields are optional because the API may return a partial object on
// first load, and fields are populated progressively.

export interface SiteSettings {
  siteName?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  whatsappNumber?: string;
  ceo_name?: string;
  ceo_title?: string;
  ceo_photo_url?: string;
  ceo_message?: string;
}

// ─── Media ────────────────────────────────────────────────────────────────────

export interface MediaFile {
  name: string;
  path: string;
  size: string | null;
  mtimeMs: number;
}

/** Media endpoint returns files grouped by folder path (year/month). */
export type MediaLibrary = Record<string, MediaFile[]>;

// ─── Events ───────────────────────────────────────────────────────────────────
// Shape: raw DB columns (events route does no transformation).

export interface CmsEvent {
  id: string;
  title: string;
  event_date: string;
  description: string | null;
  location: string;
  registration_link: string | null;
  is_published: boolean;
  banner_image: string | null;
  created_at?: string;
}

// ─── Careers ──────────────────────────────────────────────────────────────────

export interface JobOpening {
  id: string;
  title: string;
  department: string | null;
  location: string;
  type: JobType;
  description: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface JobApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  cv_url: string | null;
  status: string | null;
  created_at: string;
}

// ─── Franchise Inquiries ──────────────────────────────────────────────────────

export interface FranchiseInquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  status: FranchiseStatus;
  created_at: string;
}

// ─── Loyalty Program ──────────────────────────────────────────────────────────
// Shape: /api/cms/loyalty/{rewards,redemptions,members} GET transforms.

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string | null;
  pointsCost: number;
  stock: number | null;
  active: boolean;
  imageUrl: string | null;
  minTier: string | null;
}

export interface LoyaltyMilestone {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  points: number;
  referrerBonusPoints: number | null;
  sortOrder: number;
  active: boolean;
}

export interface LoyaltyCompletion {
  id: string;
  memberId: string;
  memberEmail: string | null;
  milestoneId: string;
  milestoneTitle: string;
  status: LoyaltyCompletionStatus;
  notes: string | null;
  submittedAt: string;
}

export interface LoyaltyRedemption {
  id: string;
  memberId: string;
  memberEmail: string | null;
  rewardTitle: string;
  pointsSpent: number;
  status: LoyaltyRedemptionStatus;
  notes: string | null;
  createdAt: string;
}

export interface LoyaltyMember {
  id: string;
  email: string | null;
  referralCode: string;
  referredByCode: string | null;
  pointsBalance: number;
  createdAt: string;
}

// ─── Aggregate State ──────────────────────────────────────────────────────────

export interface CmsDataState {
  students: Student[];
  posts: CmsBlogPost[];
  faqs: Faq[];
  countries: Country[];
  successStories: SuccessStory[];
  resources: Resource[];
  branches: Branch[];
  testimonials: Testimonial[];
  teamMembers: TeamMember[];
  settings: SiteSettings;
  media: MediaLibrary;
  events: CmsEvent[];
  jobOpenings: JobOpening[];
  jobApplications: JobApplication[];
  franchiseInquiries: FranchiseInquiry[];
  loyaltyRewards: LoyaltyReward[];
  loyaltyRedemptions: LoyaltyRedemption[];
  loyaltyMembers: LoyaltyMember[];
  loyaltyMilestones: LoyaltyMilestone[];
  loyaltyCompletions: LoyaltyCompletion[];
}

export const INITIAL_CMS_DATA: CmsDataState = {
  students: [],
  posts: [],
  faqs: [],
  countries: [],
  successStories: [],
  resources: [],
  branches: [],
  testimonials: [],
  teamMembers: [],
  settings: {},
  media: {},
  events: [],
  jobOpenings: [],
  jobApplications: [],
  franchiseInquiries: [],
  loyaltyRewards: [],
  loyaltyRedemptions: [],
  loyaltyMembers: [],
  loyaltyMilestones: [],
  loyaltyCompletions: [],
};
