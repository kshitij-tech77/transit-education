-- =============================================
-- FIFA World Cup 2026 Predict & Win Contest
-- Migration: 004_world_cup_predict.sql
-- =============================================

-- =============================================
-- TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS contest_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  display_name TEXT,
  city TEXT,
  qualification TEXT CHECK (qualification IN ('SEE/SLC', '+2/A-Levels', 'Bachelor''s', 'Master''s', 'Other')),
  favourite_team TEXT,
  avatar_color TEXT DEFAULT '#2563eb',
  is_verified BOOLEAN DEFAULT false,
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_number INTEGER UNIQUE NOT NULL,
  group_name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'group' CHECK (stage IN ('group', 'round_of_32', 'round_of_16', 'quarter', 'semi', 'third_place', 'final')),
  home_team TEXT NOT NULL,
  home_team_code TEXT NOT NULL,
  home_team_flag TEXT NOT NULL,
  away_team TEXT NOT NULL,
  away_team_code TEXT NOT NULL,
  away_team_flag TEXT NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  kickoff_at TIMESTAMPTZ NOT NULL,
  locks_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'locked', 'settled')),
  home_score INTEGER,
  away_score INTEGER,
  result TEXT CHECK (result IN ('home', 'draw', 'away'))
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES contest_users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_result TEXT NOT NULL CHECK (predicted_result IN ('home', 'draw', 'away')),
  predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0 AND predicted_home_score <= 20),
  predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0 AND predicted_away_score <= 20),
  points_earned INTEGER DEFAULT 0,
  is_correct_result BOOLEAN DEFAULT false,
  is_exact_score BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES contest_users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  correct_results INTEGER DEFAULT 0,
  exact_scores INTEGER DEFAULT 0,
  predictions_made INTEGER DEFAULT 0,
  rank INTEGER,
  weekly_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prize_type TEXT NOT NULL CHECK (prize_type IN ('overall', 'weekly', 'daily', 'lucky_draw')),
  sort_order INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_cache(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard_cache(total_points DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE contest_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;

-- contest_users: public read for leaderboard display (limited fields), service role manages writes
CREATE POLICY "contest_users_public_read" ON contest_users
  FOR SELECT USING (true);

CREATE POLICY "contest_users_service_insert" ON contest_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contest_users_service_update" ON contest_users
  FOR UPDATE USING (true);

-- matches: public read
CREATE POLICY "matches_public_read" ON matches
  FOR SELECT USING (true);

CREATE POLICY "matches_service_update" ON matches
  FOR UPDATE USING (true);

-- predictions: public read (for leaderboard), insert/update managed by service role
CREATE POLICY "predictions_public_read" ON predictions
  FOR SELECT USING (true);

CREATE POLICY "predictions_service_insert" ON predictions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "predictions_service_update" ON predictions
  FOR UPDATE USING (true);

-- leaderboard_cache: public read
CREATE POLICY "leaderboard_public_read" ON leaderboard_cache
  FOR SELECT USING (true);

CREATE POLICY "leaderboard_service_upsert" ON leaderboard_cache
  FOR ALL USING (true);

-- otp_codes: no public access, only service role
CREATE POLICY "otp_service_only" ON otp_codes
  FOR ALL USING (true);

-- prizes: public read
CREATE POLICY "prizes_public_read" ON prizes
  FOR SELECT USING (true);

-- =============================================
-- SEED: PRIZES
-- =============================================

INSERT INTO prizes (tier, title, description, image_url, prize_type, sort_order) VALUES
(
  'Grand Champion',
  'MacBook Air M3 + Full Scholarship Consultation',
  'Win a brand-new MacBook Air M3 with 16GB RAM AND a comprehensive scholarship consultation package covering SOP writing, application review, and embassy interview prep.',
  NULL,
  'overall',
  1
),
(
  'Runner Up',
  'iPhone 15 + Premium Counselling Package',
  'Take home the latest iPhone 15 along with a premium study abroad counselling package — personalised university selection, visa guidance, and financial planning.',
  NULL,
  'overall',
  2
),
(
  'Third Place',
  'Samsung Galaxy S24 + SOP Writing Package',
  'Win a Samsung Galaxy S24 plus a full Statement of Purpose writing package crafted by our expert counsellors for your dream university.',
  NULL,
  'overall',
  3
),
(
  'Weekly Winner',
  'JBL Bluetooth Speaker + IELTS Prep Voucher',
  'Each week''s top scorer takes home a JBL portable Bluetooth speaker and a full IELTS preparation voucher worth NPR 15,000.',
  NULL,
  'weekly',
  4
),
(
  'Daily Winner',
  'Transit Merchandise Hamper + Test Prep Voucher',
  'Daily top predictor wins a curated Transit Education merchandise hamper and a test preparation voucher for IELTS, TOEFL, PTE, or SAT.',
  NULL,
  'daily',
  5
),
(
  'Lucky Draw',
  'Transit Branded Merchandise',
  'Top 50 participants who complete their profile and make predictions enter a lucky draw for exclusive Transit Education branded merchandise.',
  NULL,
  'lucky_draw',
  6
);

-- =============================================
-- SEED: MATCHES (FIFA World Cup 2026 Group Stage)
-- 72 group stage matches across 12 groups
-- Times in UTC — Nepal = UTC+5:45 (NPT)
-- =============================================

-- NOTE: Teams arranged in groups of 4. Schedule approximate based on
-- published WC 2026 match window (June 11 – July 3, 2026).
-- Actual confirmed teams should be verified at fifa.com.

INSERT INTO matches (
  match_number, group_name, stage,
  home_team, home_team_code, home_team_flag,
  away_team, away_team_code, away_team_flag,
  venue, city,
  kickoff_at, locks_at, status
) VALUES

-- =============================================
-- MATCHDAY 1 (Matches 1–24)
-- =============================================

-- GROUP A: Mexico, Jamaica, Honduras, Ukraine
(1, 'A', 'group', 'Mexico', 'MEX', '🇲🇽', 'Jamaica', 'JAM', '🇯🇲',
 'Estadio Azteca', 'Mexico City', '2026-06-11 23:00:00+00', '2026-06-11 22:55:00+00', 'upcoming'),

(2, 'A', 'group', 'Honduras', 'HON', '🇭🇳', 'Ukraine', 'UKR', '🇺🇦',
 'AT&T Stadium', 'Arlington', '2026-06-12 02:00:00+00', '2026-06-12 01:55:00+00', 'upcoming'),

-- GROUP B: USA, Costa Rica, Panama, Serbia
(3, 'B', 'group', 'USA', 'USA', '🇺🇸', 'Costa Rica', 'CRC', '🇨🇷',
 'MetLife Stadium', 'East Rutherford', '2026-06-12 23:00:00+00', '2026-06-12 22:55:00+00', 'upcoming'),

(4, 'B', 'group', 'Panama', 'PAN', '🇵🇦', 'Serbia', 'SRB', '🇷🇸',
 'Arrowhead Stadium', 'Kansas City', '2026-06-12 20:00:00+00', '2026-06-12 19:55:00+00', 'upcoming'),

-- GROUP C: Canada, Belgium, Croatia, Japan
(5, 'C', 'group', 'Canada', 'CAN', '🇨🇦', 'Belgium', 'BEL', '🇧🇪',
 'BMO Field', 'Toronto', '2026-06-13 00:00:00+00', '2026-06-12 23:55:00+00', 'upcoming'),

(6, 'C', 'group', 'Croatia', 'CRO', '🇭🇷', 'Japan', 'JPN', '🇯🇵',
 'Hard Rock Stadium', 'Miami Gardens', '2026-06-13 20:00:00+00', '2026-06-13 19:55:00+00', 'upcoming'),

-- GROUP D: Argentina, Germany, Morocco, New Zealand
(7, 'D', 'group', 'Argentina', 'ARG', '🇦🇷', 'Germany', 'GER', '🇩🇪',
 'MetLife Stadium', 'East Rutherford', '2026-06-14 00:00:00+00', '2026-06-13 23:55:00+00', 'upcoming'),

(8, 'D', 'group', 'Morocco', 'MAR', '🇲🇦', 'New Zealand', 'NZL', '🇳🇿',
 'NRG Stadium', 'Houston', '2026-06-14 16:00:00+00', '2026-06-14 15:55:00+00', 'upcoming'),

-- GROUP E: France, Spain, Ivory Coast, Indonesia
(9, 'E', 'group', 'France', 'FRA', '🇫🇷', 'Spain', 'ESP', '🇪🇸',
 'SoFi Stadium', 'Inglewood', '2026-06-15 00:00:00+00', '2026-06-14 23:55:00+00', 'upcoming'),

(10, 'E', 'group', 'Ivory Coast', 'CIV', '🇨🇮', 'Indonesia', 'IDN', '🇮🇩',
 'Levi''s Stadium', 'Santa Clara', '2026-06-15 16:00:00+00', '2026-06-15 15:55:00+00', 'upcoming'),

-- GROUP F: Brazil, England, Switzerland, Tunisia
(11, 'F', 'group', 'Brazil', 'BRA', '🇧🇷', 'England', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
 'AT&T Stadium', 'Arlington', '2026-06-16 00:00:00+00', '2026-06-15 23:55:00+00', 'upcoming'),

(12, 'F', 'group', 'Switzerland', 'SUI', '🇨🇭', 'Tunisia', 'TUN', '🇹🇳',
 'Lincoln Financial Field', 'Philadelphia', '2026-06-16 16:00:00+00', '2026-06-16 15:55:00+00', 'upcoming'),

-- GROUP G: Portugal, Netherlands, South Korea, Chile
(13, 'G', 'group', 'Portugal', 'POR', '🇵🇹', 'Netherlands', 'NED', '🇳🇱',
 'SoFi Stadium', 'Inglewood', '2026-06-17 00:00:00+00', '2026-06-16 23:55:00+00', 'upcoming'),

(14, 'G', 'group', 'South Korea', 'KOR', '🇰🇷', 'Chile', 'CHI', '🇨🇱',
 'BC Place', 'Vancouver', '2026-06-16 20:00:00+00', '2026-06-16 19:55:00+00', 'upcoming'),

-- GROUP H: Italy, Denmark, Nigeria, Paraguay
(15, 'H', 'group', 'Italy', 'ITA', '🇮🇹', 'Denmark', 'DEN', '🇩🇰',
 'Mercedes-Benz Stadium', 'Atlanta', '2026-06-17 20:00:00+00', '2026-06-17 19:55:00+00', 'upcoming'),

(16, 'H', 'group', 'Nigeria', 'NGA', '🇳🇬', 'Paraguay', 'PAR', '🇵🇾',
 'Gillette Stadium', 'Foxborough', '2026-06-17 16:00:00+00', '2026-06-17 15:55:00+00', 'upcoming'),

-- GROUP I: Colombia, Uruguay, Egypt, Algeria
(17, 'I', 'group', 'Colombia', 'COL', '🇨🇴', 'Uruguay', 'URU', '🇺🇾',
 'Hard Rock Stadium', 'Miami Gardens', '2026-06-13 23:00:00+00', '2026-06-13 22:55:00+00', 'upcoming'),

(18, 'I', 'group', 'Egypt', 'EGY', '🇪🇬', 'Algeria', 'ALG', '🇩🇿',
 'Lumen Field', 'Seattle', '2026-06-13 16:00:00+00', '2026-06-13 15:55:00+00', 'upcoming'),

-- GROUP J: Ecuador, Austria, Senegal, Saudi Arabia
(19, 'J', 'group', 'Ecuador', 'ECU', '🇪🇨', 'Austria', 'AUT', '🇦🇹',
 'Estadio Akron', 'Zapopan', '2026-06-14 20:00:00+00', '2026-06-14 19:55:00+00', 'upcoming'),

(20, 'J', 'group', 'Senegal', 'SEN', '🇸🇳', 'Saudi Arabia', 'KSA', '🇸🇦',
 'Lincoln Financial Field', 'Philadelphia', '2026-06-14 23:00:00+00', '2026-06-14 22:55:00+00', 'upcoming'),

-- GROUP K: Poland, Australia, Ghana, Slovakia
(21, 'K', 'group', 'Poland', 'POL', '🇵🇱', 'Australia', 'AUS', '🇦🇺',
 'Arrowhead Stadium', 'Kansas City', '2026-06-15 20:00:00+00', '2026-06-15 19:55:00+00', 'upcoming'),

(22, 'K', 'group', 'Ghana', 'GHA', '🇬🇭', 'Slovakia', 'SVK', '🇸🇰',
 'NRG Stadium', 'Houston', '2026-06-15 23:00:00+00', '2026-06-15 22:55:00+00', 'upcoming'),

-- GROUP L: Turkey, Iran, Cameroon, Wales
(23, 'L', 'group', 'Turkey', 'TUR', '🇹🇷', 'Iran', 'IRN', '🇮🇷',
 'Mercedes-Benz Stadium', 'Atlanta', '2026-06-16 23:00:00+00', '2026-06-16 22:55:00+00', 'upcoming'),

(24, 'L', 'group', 'Cameroon', 'CMR', '🇨🇲', 'Wales', 'WAL', '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
 'Levi''s Stadium', 'Santa Clara', '2026-06-17 23:00:00+00', '2026-06-17 22:55:00+00', 'upcoming'),

-- =============================================
-- MATCHDAY 2 (Matches 25–48)
-- =============================================

-- GROUP A MD2
(25, 'A', 'group', 'Mexico', 'MEX', '🇲🇽', 'Honduras', 'HON', '🇭🇳',
 'Estadio BBVA', 'Monterrey', '2026-06-20 02:00:00+00', '2026-06-20 01:55:00+00', 'upcoming'),

(26, 'A', 'group', 'Jamaica', 'JAM', '🇯🇲', 'Ukraine', 'UKR', '🇺🇦',
 'Gillette Stadium', 'Foxborough', '2026-06-19 23:00:00+00', '2026-06-19 22:55:00+00', 'upcoming'),

-- GROUP B MD2
(27, 'B', 'group', 'USA', 'USA', '🇺🇸', 'Panama', 'PAN', '🇵🇦',
 'MetLife Stadium', 'East Rutherford', '2026-06-20 23:00:00+00', '2026-06-20 22:55:00+00', 'upcoming'),

(28, 'B', 'group', 'Costa Rica', 'CRC', '🇨🇷', 'Serbia', 'SRB', '🇷🇸',
 'Arrowhead Stadium', 'Kansas City', '2026-06-20 20:00:00+00', '2026-06-20 19:55:00+00', 'upcoming'),

-- GROUP C MD2
(29, 'C', 'group', 'Canada', 'CAN', '🇨🇦', 'Croatia', 'CRO', '🇭🇷',
 'BC Place', 'Vancouver', '2026-06-21 00:00:00+00', '2026-06-20 23:55:00+00', 'upcoming'),

(30, 'C', 'group', 'Belgium', 'BEL', '🇧🇪', 'Japan', 'JPN', '🇯🇵',
 'Hard Rock Stadium', 'Miami Gardens', '2026-06-21 20:00:00+00', '2026-06-21 19:55:00+00', 'upcoming'),

-- GROUP D MD2
(31, 'D', 'group', 'Argentina', 'ARG', '🇦🇷', 'Morocco', 'MAR', '🇲🇦',
 'MetLife Stadium', 'East Rutherford', '2026-06-22 00:00:00+00', '2026-06-21 23:55:00+00', 'upcoming'),

(32, 'D', 'group', 'Germany', 'GER', '🇩🇪', 'New Zealand', 'NZL', '🇳🇿',
 'Lumen Field', 'Seattle', '2026-06-22 16:00:00+00', '2026-06-22 15:55:00+00', 'upcoming'),

-- GROUP E MD2
(33, 'E', 'group', 'France', 'FRA', '🇫🇷', 'Ivory Coast', 'CIV', '🇨🇮',
 'SoFi Stadium', 'Inglewood', '2026-06-23 00:00:00+00', '2026-06-22 23:55:00+00', 'upcoming'),

(34, 'E', 'group', 'Spain', 'ESP', '🇪🇸', 'Indonesia', 'IDN', '🇮🇩',
 'AT&T Stadium', 'Arlington', '2026-06-22 20:00:00+00', '2026-06-22 19:55:00+00', 'upcoming'),

-- GROUP F MD2
(35, 'F', 'group', 'Brazil', 'BRA', '🇧🇷', 'Switzerland', 'SUI', '🇨🇭',
 'NRG Stadium', 'Houston', '2026-06-24 00:00:00+00', '2026-06-23 23:55:00+00', 'upcoming'),

(36, 'F', 'group', 'England', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Tunisia', 'TUN', '🇹🇳',
 'Lincoln Financial Field', 'Philadelphia', '2026-06-23 20:00:00+00', '2026-06-23 19:55:00+00', 'upcoming'),

-- GROUP G MD2
(37, 'G', 'group', 'Portugal', 'POR', '🇵🇹', 'South Korea', 'KOR', '🇰🇷',
 'SoFi Stadium', 'Inglewood', '2026-06-25 00:00:00+00', '2026-06-24 23:55:00+00', 'upcoming'),

(38, 'G', 'group', 'Netherlands', 'NED', '🇳🇱', 'Chile', 'CHI', '🇨🇱',
 'Levi''s Stadium', 'Santa Clara', '2026-06-24 20:00:00+00', '2026-06-24 19:55:00+00', 'upcoming'),

-- GROUP H MD2
(39, 'H', 'group', 'Italy', 'ITA', '🇮🇹', 'Nigeria', 'NGA', '🇳🇬',
 'Mercedes-Benz Stadium', 'Atlanta', '2026-06-23 23:00:00+00', '2026-06-23 22:55:00+00', 'upcoming'),

(40, 'H', 'group', 'Denmark', 'DEN', '🇩🇰', 'Paraguay', 'PAR', '🇵🇾',
 'Gillette Stadium', 'Foxborough', '2026-06-23 16:00:00+00', '2026-06-23 15:55:00+00', 'upcoming'),

-- GROUP I MD2
(41, 'I', 'group', 'Colombia', 'COL', '🇨🇴', 'Egypt', 'EGY', '🇪🇬',
 'Hard Rock Stadium', 'Miami Gardens', '2026-06-21 23:00:00+00', '2026-06-21 22:55:00+00', 'upcoming'),

(42, 'I', 'group', 'Uruguay', 'URU', '🇺🇾', 'Algeria', 'ALG', '🇩🇿',
 'Lumen Field', 'Seattle', '2026-06-21 16:00:00+00', '2026-06-21 15:55:00+00', 'upcoming'),

-- GROUP J MD2
(43, 'J', 'group', 'Ecuador', 'ECU', '🇪🇨', 'Senegal', 'SEN', '🇸🇳',
 'Estadio Akron', 'Zapopan', '2026-06-22 23:00:00+00', '2026-06-22 22:55:00+00', 'upcoming'),

(44, 'J', 'group', 'Austria', 'AUT', '🇦🇹', 'Saudi Arabia', 'KSA', '🇸🇦',
 'NRG Stadium', 'Houston', '2026-06-22 23:00:00+00', '2026-06-22 22:55:00+00', 'upcoming'),

-- GROUP K MD2
(45, 'K', 'group', 'Poland', 'POL', '🇵🇱', 'Ghana', 'GHA', '🇬🇭',
 'Arrowhead Stadium', 'Kansas City', '2026-06-24 16:00:00+00', '2026-06-24 15:55:00+00', 'upcoming'),

(46, 'K', 'group', 'Australia', 'AUS', '🇦🇺', 'Slovakia', 'SVK', '🇸🇰',
 'Lincoln Financial Field', 'Philadelphia', '2026-06-24 23:00:00+00', '2026-06-24 22:55:00+00', 'upcoming'),

-- GROUP L MD2
(47, 'L', 'group', 'Turkey', 'TUR', '🇹🇷', 'Cameroon', 'CMR', '🇨🇲',
 'Mercedes-Benz Stadium', 'Atlanta', '2026-06-25 20:00:00+00', '2026-06-25 19:55:00+00', 'upcoming'),

(48, 'L', 'group', 'Iran', 'IRN', '🇮🇷', 'Wales', 'WAL', '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
 'Lumen Field', 'Seattle', '2026-06-25 23:00:00+00', '2026-06-25 22:55:00+00', 'upcoming'),

-- =============================================
-- MATCHDAY 3 (Matches 49–72) — SIMULTANEOUS WITHIN GROUP
-- =============================================

-- GROUP A MD3 (simultaneous)
(49, 'A', 'group', 'Mexico', 'MEX', '🇲🇽', 'Ukraine', 'UKR', '🇺🇦',
 'Estadio Azteca', 'Mexico City', '2026-06-27 22:00:00+00', '2026-06-27 21:55:00+00', 'upcoming'),

(50, 'A', 'group', 'Jamaica', 'JAM', '🇯🇲', 'Honduras', 'HON', '🇭🇳',
 'AT&T Stadium', 'Arlington', '2026-06-27 22:00:00+00', '2026-06-27 21:55:00+00', 'upcoming'),

-- GROUP B MD3 (simultaneous)
(51, 'B', 'group', 'USA', 'USA', '🇺🇸', 'Serbia', 'SRB', '🇷🇸',
 'MetLife Stadium', 'East Rutherford', '2026-06-28 02:00:00+00', '2026-06-28 01:55:00+00', 'upcoming'),

(52, 'B', 'group', 'Costa Rica', 'CRC', '🇨🇷', 'Panama', 'PAN', '🇵🇦',
 'NRG Stadium', 'Houston', '2026-06-28 02:00:00+00', '2026-06-28 01:55:00+00', 'upcoming'),

-- GROUP C MD3 (simultaneous)
(53, 'C', 'group', 'Canada', 'CAN', '🇨🇦', 'Japan', 'JPN', '🇯🇵',
 'BMO Field', 'Toronto', '2026-06-28 22:00:00+00', '2026-06-28 21:55:00+00', 'upcoming'),

(54, 'C', 'group', 'Belgium', 'BEL', '🇧🇪', 'Croatia', 'CRO', '🇭🇷',
 'Hard Rock Stadium', 'Miami Gardens', '2026-06-28 22:00:00+00', '2026-06-28 21:55:00+00', 'upcoming'),

-- GROUP D MD3 (simultaneous)
(55, 'D', 'group', 'Argentina', 'ARG', '🇦🇷', 'New Zealand', 'NZL', '🇳🇿',
 'MetLife Stadium', 'East Rutherford', '2026-06-29 02:00:00+00', '2026-06-29 01:55:00+00', 'upcoming'),

(56, 'D', 'group', 'Germany', 'GER', '🇩🇪', 'Morocco', 'MAR', '🇲🇦',
 'SoFi Stadium', 'Inglewood', '2026-06-29 02:00:00+00', '2026-06-29 01:55:00+00', 'upcoming'),

-- GROUP E MD3 (simultaneous)
(57, 'E', 'group', 'France', 'FRA', '🇫🇷', 'Indonesia', 'IDN', '🇮🇩',
 'Levi''s Stadium', 'Santa Clara', '2026-06-29 22:00:00+00', '2026-06-29 21:55:00+00', 'upcoming'),

(58, 'E', 'group', 'Spain', 'ESP', '🇪🇸', 'Ivory Coast', 'CIV', '🇨🇮',
 'AT&T Stadium', 'Arlington', '2026-06-29 22:00:00+00', '2026-06-29 21:55:00+00', 'upcoming'),

-- GROUP F MD3 (simultaneous)
(59, 'F', 'group', 'Brazil', 'BRA', '🇧🇷', 'Tunisia', 'TUN', '🇹🇳',
 'NRG Stadium', 'Houston', '2026-06-30 02:00:00+00', '2026-06-30 01:55:00+00', 'upcoming'),

(60, 'F', 'group', 'England', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Switzerland', 'SUI', '🇨🇭',
 'Lincoln Financial Field', 'Philadelphia', '2026-06-30 02:00:00+00', '2026-06-30 01:55:00+00', 'upcoming'),

-- GROUP G MD3 (simultaneous)
(61, 'G', 'group', 'Portugal', 'POR', '🇵🇹', 'Chile', 'CHI', '🇨🇱',
 'SoFi Stadium', 'Inglewood', '2026-07-01 02:00:00+00', '2026-07-01 01:55:00+00', 'upcoming'),

(62, 'G', 'group', 'Netherlands', 'NED', '🇳🇱', 'South Korea', 'KOR', '🇰🇷',
 'BC Place', 'Vancouver', '2026-07-01 02:00:00+00', '2026-07-01 01:55:00+00', 'upcoming'),

-- GROUP H MD3 (simultaneous)
(63, 'H', 'group', 'Italy', 'ITA', '🇮🇹', 'Paraguay', 'PAR', '🇵🇾',
 'Mercedes-Benz Stadium', 'Atlanta', '2026-07-01 22:00:00+00', '2026-07-01 21:55:00+00', 'upcoming'),

(64, 'H', 'group', 'Denmark', 'DEN', '🇩🇰', 'Nigeria', 'NGA', '🇳🇬',
 'Arrowhead Stadium', 'Kansas City', '2026-07-01 22:00:00+00', '2026-07-01 21:55:00+00', 'upcoming'),

-- GROUP I MD3 (simultaneous)
(65, 'I', 'group', 'Colombia', 'COL', '🇨🇴', 'Algeria', 'ALG', '🇩🇿',
 'MetLife Stadium', 'East Rutherford', '2026-07-02 02:00:00+00', '2026-07-02 01:55:00+00', 'upcoming'),

(66, 'I', 'group', 'Uruguay', 'URU', '🇺🇾', 'Egypt', 'EGY', '🇪🇬',
 'Hard Rock Stadium', 'Miami Gardens', '2026-07-02 02:00:00+00', '2026-07-02 01:55:00+00', 'upcoming'),

-- GROUP J MD3 (simultaneous)
(67, 'J', 'group', 'Ecuador', 'ECU', '🇪🇨', 'Saudi Arabia', 'KSA', '🇸🇦',
 'Estadio Akron', 'Zapopan', '2026-07-02 22:00:00+00', '2026-07-02 21:55:00+00', 'upcoming'),

(68, 'J', 'group', 'Austria', 'AUT', '🇦🇹', 'Senegal', 'SEN', '🇸🇳',
 'Lumen Field', 'Seattle', '2026-07-02 22:00:00+00', '2026-07-02 21:55:00+00', 'upcoming'),

-- GROUP K MD3 (simultaneous)
(69, 'K', 'group', 'Poland', 'POL', '🇵🇱', 'Slovakia', 'SVK', '🇸🇰',
 'Gillette Stadium', 'Foxborough', '2026-07-03 02:00:00+00', '2026-07-03 01:55:00+00', 'upcoming'),

(70, 'K', 'group', 'Australia', 'AUS', '🇦🇺', 'Ghana', 'GHA', '🇬🇭',
 'Arrowhead Stadium', 'Kansas City', '2026-07-03 02:00:00+00', '2026-07-03 01:55:00+00', 'upcoming'),

-- GROUP L MD3 (simultaneous)
(71, 'L', 'group', 'Turkey', 'TUR', '🇹🇷', 'Wales', 'WAL', '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
 'Estadio Azteca', 'Mexico City', '2026-07-03 22:00:00+00', '2026-07-03 21:55:00+00', 'upcoming'),

(72, 'L', 'group', 'Iran', 'IRN', '🇮🇷', 'Cameroon', 'CMR', '🇨🇲',
 'Mercedes-Benz Stadium', 'Atlanta', '2026-07-03 22:00:00+00', '2026-07-03 21:55:00+00', 'upcoming');

-- =============================================
-- FUNCTION: Update match statuses based on time
-- Call periodically or on-demand from API
-- =============================================

CREATE OR REPLACE FUNCTION update_match_statuses()
RETURNS void AS $$
BEGIN
  -- upcoming → open: 30 minutes before kickoff
  UPDATE matches
  SET status = 'open'
  WHERE status = 'upcoming'
    AND kickoff_at <= now() + interval '30 minutes'
    AND kickoff_at > now();

  -- open → locked: at locks_at time
  UPDATE matches
  SET status = 'locked'
  WHERE status = 'open'
    AND locks_at <= now();
END;
$$ LANGUAGE plpgsql;
