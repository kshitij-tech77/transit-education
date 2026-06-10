-- Migration 001: Add TikTok URL to site_settings and insert Germany into countries
-- Run this in your Supabase SQL Editor

-- 1. Add TikTok URL column to site_settings
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

-- 2. Insert Germany into countries table
-- Run only if Germany does not already exist
INSERT INTO countries (
  id,
  code,
  name,
  flag,
  status,
  hero_title,
  why_study,
  intakes,
  visa_time,
  tuition_range,
  required_documents,
  entry_requirements,
  visa_process,
  meta_title,
  meta_description
)
VALUES (
  'germany',
  'germany',
  'Germany',
  'DE',
  'LIVE',
  'Study in Germany — World-Class Education, Almost Free',
  'Germany offers tuition-free education at most public universities for international students. With over 1,500 English-taught programs, DAAD scholarships, and an 18-month post-study work visa, Germany is one of the smartest study destinations for Nepali students.',
  'October (Winter Semester) & April (Summer Semester). Winter is the main intake. Apply 6 months in advance.',
  '6–12 weeks (National D Visa)',
  '€0–€1,000/yr (public universities, semester fee only)',
  ARRAY[
    'Passport (valid)',
    'APS Certificate (mandatory for Nepal)',
    'University Admission Letter',
    'Blocked Account (Sperrkonto) — €11,208',
    'Academic Transcripts & Certificates',
    'Language Certificate (TestDaF / IELTS)',
    'Health Insurance Proof',
    'Biometric Passport Photos'
  ],
  '{
    "ug": [
      "Completed +2 (Grade 12) with minimum 60% aggregate",
      "APS certificate mandatory — apply at German Embassy Kathmandu",
      "German language: TestDaF B2/C1 for German-taught programs",
      "English programs: IELTS 6.0+ or TOEFL iBT 80+",
      "Some programs require entrance exam (Aufnahmeprüfung)"
    ],
    "pg": [
      "Bachelor''s degree (min 3 years) from a recognized institution",
      "APS certificate mandatory",
      "GPA equivalent to German 2.5 or better (approx. 60%+)",
      "English programs: IELTS 6.5+ or TOEFL iBT 90+",
      "DAAD or other scholarship application recommended"
    ]
  }'::jsonb,
  '[
    {"title": "Get APS Certificate", "text": "All Nepali students must obtain an APS (Academic Evaluation Centre) certificate before applying. Apply at the German Embassy Kathmandu. Processing: 4–8 weeks."},
    {"title": "Apply to University / uni-assist", "text": "Apply directly or via uni-assist. Winter semester (October): apply by May–June. Summer semester (April): apply by November–January."},
    {"title": "Receive Admission Letter", "text": "Once accepted, you receive a formal Zulassungsbescheid (admission letter). Required for visa application."},
    {"title": "Open Blocked Account (Sperrkonto)", "text": "Deposit €11,208 into a German blocked account via Fintiba, Expatrio, or Deutsche Bank. Money released monthly after arrival."},
    {"title": "Gather Visa Documents", "text": "Compile: admission letter, APS certificate, blocked account confirmation, health insurance, language certificate, passport, photos."},
    {"title": "Submit National D Visa Application", "text": "Apply at German Embassy Kathmandu. Processing: 6–12 weeks. Book appointment well in advance — slots fill fast."}
  ]'::jsonb,
  'Study in Germany from Nepal | Free Education, APS & DAAD — Transit Education',
  'Complete guide to studying in Germany from Nepal. Free public university education, APS certificate process, DAAD scholarships, blocked account (€11,208), and National D Visa guidance.'
)
ON CONFLICT (id) DO NOTHING;
