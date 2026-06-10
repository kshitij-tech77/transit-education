-- Migration 002: Add sub-page content fields to countries table
-- These fields power the /study-abroad/[country]/visa, /scholarships, /cost, /universities sub-pages
-- Run this in your Supabase SQL Editor

-- Cost of living breakdown (for /cost sub-page)
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS cost_of_living JSONB;

-- Scholarship data (for /scholarships sub-page)
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS scholarship_data JSONB;

-- City guides (for /universities sub-page)
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS city_guides JSONB;

-- Extended visa content (for /visa sub-page)
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS visa_extended JSONB;

-- University list with details (for /universities sub-page)
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS university_list JSONB;

-- EXAMPLE DATA: Canada cost_of_living
-- Run separately if you want to populate Canada immediately:
/*
UPDATE countries
SET cost_of_living = '{
  "currency": "CAD",
  "cities": [
    {
      "name": "Toronto",
      "rent_shared": "CA$800–$1,400/month",
      "rent_private": "CA$1,400–$2,200/month",
      "food": "CA$300–$500/month",
      "transport": "CA$156/month (TTC pass)",
      "total_estimate": "CA$1,500–$2,500/month"
    },
    {
      "name": "Vancouver",
      "rent_shared": "CA$900–$1,600/month",
      "rent_private": "CA$1,600–$2,500/month",
      "food": "CA$300–$500/month",
      "transport": "CA$120/month (TransLink)",
      "total_estimate": "CA$1,600–$2,700/month"
    },
    {
      "name": "Winnipeg",
      "rent_shared": "CA$500–$800/month",
      "rent_private": "CA$800–$1,200/month",
      "food": "CA$250–$400/month",
      "transport": "CA$100/month",
      "total_estimate": "CA$1,000–$1,600/month"
    }
  ],
  "notes": ["Students can work 24 hours/week off-campus", "On-campus work is unlimited", "PGWP allows full-time work after graduation"]
}'::jsonb
WHERE id = 'canada';
*/

-- EXAMPLE DATA: Canada scholarship_data
/*
UPDATE countries
SET scholarship_data = '{
  "scholarships": [
    {
      "name": "Vanier Canada Graduate Scholarships",
      "amount": "CA$50,000/year for 3 years",
      "level": "PhD",
      "deadline": "November (annual)",
      "eligibility": "International students nominated by Canadian university",
      "link": "https://vanier.gc.ca"
    },
    {
      "name": "Ontario Graduate Scholarship (OGS)",
      "amount": "CA$10,000/year",
      "level": "Master''s / PhD",
      "deadline": "Varies by university (January–March)",
      "eligibility": "Academic excellence (A- average or higher)"
    },
    {
      "name": "University-Specific Merit Scholarships",
      "amount": "CA$3,000–$25,000/year",
      "level": "Bachelor''s / Master''s",
      "deadline": "Application deadline varies",
      "eligibility": "Automatic with admission — based on GPA and test scores"
    }
  ]
}'::jsonb
WHERE id = 'canada';
*/
