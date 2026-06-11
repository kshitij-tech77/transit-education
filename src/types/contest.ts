// =============================================
// FIFA World Cup 2026 Contest Types
// =============================================

export type MatchStatus = 'upcoming' | 'open' | 'locked' | 'settled';
export type MatchResult = 'home' | 'draw' | 'away';
export type MatchStage = 'group' | 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'third_place' | 'final';
export type PrizeType = 'overall' | 'weekly' | 'daily' | 'lucky_draw';
export type Qualification = 'SEE/SLC' | '+2/A-Levels' | "Bachelor's" | "Master's" | 'Other';

export interface ContestUser {
  id: string;
  email: string;
  phone: string | null;
  display_name: string | null;
  city: string | null;
  qualification: Qualification | null;
  favourite_team: string | null;
  avatar_color: string;
  is_verified: boolean;
  profile_complete: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  match_number: number;
  group_name: string;
  stage: MatchStage;
  home_team: string;
  home_team_code: string;
  home_team_flag: string;
  away_team: string;
  away_team_code: string;
  away_team_flag: string;
  venue: string;
  city: string;
  kickoff_at: string;
  locks_at: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  result: MatchResult | null;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_result: MatchResult;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number;
  is_correct_result: boolean;
  is_exact_score: boolean;
  submitted_at: string;
}

export interface LeaderboardCache {
  id: string;
  user_id: string;
  total_points: number;
  correct_results: number;
  exact_scores: number;
  predictions_made: number;
  rank: number | null;
  weekly_points: number;
  updated_at: string;
}

export interface OtpCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface Prize {
  id: string;
  tier: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prize_type: PrizeType;
  sort_order: number;
}

// =============================================
// Derived / joined types
// =============================================

export interface LeaderboardEntry extends LeaderboardCache {
  contest_users: Pick<ContestUser, 'display_name' | 'city' | 'avatar_color' | 'email'>;
}

export interface PredictionWithMatch extends Prediction {
  matches: Match;
}

export interface MatchWithPrediction extends Match {
  prediction?: Prediction | null;
}

export interface UserProfile extends ContestUser {
  leaderboard?: LeaderboardCache | null;
  predictions?: PredictionWithMatch[];
}

// =============================================
// API request / response types
// =============================================

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  user: ContestUser;
  token: string;
  isNewUser: boolean;
}

export interface PredictRequest {
  match_id: string;
  predicted_result: MatchResult;
  predicted_home_score: number;
  predicted_away_score: number;
}

export interface PredictResponse {
  success: boolean;
  prediction: Prediction;
}

export interface AdminResultRequest {
  match_id: string;
  home_score: number;
  away_score: number;
}

export interface UpdateProfileRequest {
  display_name: string;
  city: string;
  qualification: Qualification;
  favourite_team?: string;
  avatar_color: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
}

export interface MeResponse {
  user: ContestUser;
  leaderboard: LeaderboardCache | null;
  predictions: PredictionWithMatch[];
}

// =============================================
// Client-side state types
// =============================================

export interface ContestAuthState {
  user: ContestUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type AuthStep = 'email' | 'otp' | 'profile';

export const AVATAR_COLORS = [
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
] as const;

export type AvatarColor = typeof AVATAR_COLORS[number];

export const PRIZE_TIER_COLORS: Record<string, string> = {
  'Grand Champion': '#fbbf24',
  'Runner Up':      '#9ca3af',
  'Third Place':    '#d97706',
  'Weekly Winner':  '#2563eb',
  'Daily Winner':   '#10b981',
  'Lucky Draw':     '#8b5cf6',
};

export const PRIZE_TIER_LABELS: Record<PrizeType, string> = {
  overall:     'Overall',
  weekly:      'Weekly',
  daily:       'Daily',
  lucky_draw:  'Lucky Draw',
};

export const QUALIFICATION_OPTIONS: Qualification[] = [
  'SEE/SLC',
  '+2/A-Levels',
  "Bachelor's",
  "Master's",
  'Other',
];
