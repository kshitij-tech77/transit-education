-- Migration 003: Add CMS feature/tagline columns, populate 5 country pages, insert FAQs
-- Run in Supabase SQL Editor

-- ============================================================
-- STEP 1: Add new columns to countries table
-- ============================================================
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS feature1_title TEXT,
  ADD COLUMN IF NOT EXISTS feature1_desc TEXT,
  ADD COLUMN IF NOT EXISTS feature2_title TEXT,
  ADD COLUMN IF NOT EXISTS feature2_desc TEXT,
  ADD COLUMN IF NOT EXISTS visa_section_title TEXT;

-- ============================================================
-- STEP 2: AUSTRALIA
-- ============================================================
UPDATE countries SET
  hero_title        = 'Study in Australia',
  why_study         = 'Australia is the world''s third-most popular destination for international students, home to 6 QS Top 100 universities and over 22,000 courses across 1,100+ institutions.',
  tagline           = 'World-Class Degrees, Student Protections & Work Rights',
  feature1_title    = '22,000+ Courses Available',
  feature1_desc     = 'Australia offers the widest variety of study programs across VET, undergraduate, postgraduate, and doctoral levels, with qualifications recognized by employers worldwide.',
  feature2_title    = 'Work While You Study',
  feature2_desc     = 'International students can work unlimited hours during their studies (from July 2023 policy change) and gain post-study work rights for up to 6 years depending on qualification level.',
  intakes           = 'February (Primary), July (Secondary), November (Trimester — select institutions)',
  visa_section_title = 'Australian Student Visa (Subclass 500) — Step-by-Step Journey',
  required_documents = ARRAY[
    'Valid Passport (minimum 6 months validity)',
    'Academic Transcripts and Certificates (Class 10, Class 12 / NEB, Bachelor''s)',
    'IELTS or PTE Academic Score Sheet',
    'Statement of Purpose (SOP)',
    'Updated Resume / CV',
    'Letters of Recommendation (2 academic or professional)',
    'Proof of Financial Funds (bank statement — minimum AUD 29,710 for 2026)',
    'Overseas Student Health Cover (OSHC) — purchased after offer letter',
    'Passport-size Photographs (white background)',
    'Police Clearance Certificate (for courses above 12 months)'
  ],
  entry_requirements = '{
    "ug": [
      "Minimum 60% aggregate in NEB +2 (Class 12) or equivalent.",
      "IELTS 6.0 overall with no individual band below 5.5 (most universities). Some universities require 6.5.",
      "PTE Academic score of 50 overall with no communicative skill below 42 is accepted as alternative.",
      "Completion of 12 years of formal schooling (NEB +2 is accepted — no foundation year required at most institutions)."
    ],
    "pg": [
      "Bachelor''s degree with minimum 50% aggregate (first division preferred for top universities).",
      "IELTS 6.5 overall with no individual band below 6.0 (standard requirement). Some programs require 7.0.",
      "PTE Academic 58 overall with no communicative skill below 50.",
      "Relevant work experience (preferred but not mandatory for most taught master''s programs).",
      "GMAT/GRE may be required for MBA and select engineering programs at top universities."
    ]
  }'::jsonb,
  visa_process = '[
    {"title": "Receive Your Confirmation of Enrolment (COE)", "text": "After receiving your offer letter and paying the required tuition deposit (typically one semester), your Australian institution will issue a Confirmation of Enrolment (COE). This is your official document proving your enrollment and is required to apply for the Student Visa Subclass 500."},
    {"title": "Apply for No Objection Certificate (NOC) from Nepal MOE", "text": "All Nepali students must obtain a No Objection Certificate (NOC) from the Ministry of Education, Science and Technology (MOEST) before submitting their visa application. Applied online through the MOEST portal — typically takes 7–14 business days. Your Transit counsellor will guide you through the NOC documentation."},
    {"title": "Purchase Overseas Student Health Cover (OSHC)", "text": "OSHC is mandatory for all international students in Australia for the full duration of your visa. Must be purchased before applying for your visa. Approved providers include Medibank, Bupa, AHM, Allianz, and nib. Cost is approximately AUD 300–600 per year for a single student."},
    {"title": "Submit Online Visa Application via ImmiAccount", "text": "Your Student Visa (Subclass 500) application is submitted entirely online through the Australian Government''s ImmiAccount portal. Upload your COE, passport, OSHC, financial documents, SOP/GTE statement, English test results, and academic transcripts. Visa application fee is AUD 710 (approximately NPR 73,000). Biometrics collected at VFS Global in Kathmandu if requested."},
    {"title": "GTE Assessment & Visa Decision", "text": "The Department of Home Affairs will assess your Genuine Temporary Entrant (GTE) statement — your written explanation of why you intend to study in Australia and return to Nepal after. Processing times are typically 4–8 weeks. Once granted, your visa allows entry to Australia and full-time study rights for the duration of your enrollment."}
  ]'::jsonb,
  meta_title        = 'Study in Australia from Nepal | Visa, Requirements & Scholarships — Transit Education',
  meta_description  = 'Complete guide to studying in Australia from Nepal. Student Visa Subclass 500, GTE statement, OSHC, IELTS requirements, tuition fees, and scholarship options for Nepali students.'
WHERE id = 'australia';

-- ============================================================
-- STEP 3: CANADA
-- ============================================================
UPDATE countries SET
  hero_title        = 'Study in Canada',
  why_study         = 'Canada is the world''s second-largest country and one of the safest, most multicultural study destinations — offering a clear pathway from student visa to permanent residency.',
  tagline           = 'World-Class Education, Work Rights & a Path to PR',
  feature1_title    = 'Quality Education & Variety',
  feature1_desc     = 'The Canadian education system is internationally recognized for its quality, diversity of programs, and research output. Canada has 26 universities in the QS World Top 500 rankings.',
  feature2_title    = 'Work & Permanent Residency Path',
  feature2_desc     = 'Graduate with a PGWP (Post-Graduation Work Permit) for up to 3 years. Then apply for Permanent Residency through Express Entry or Provincial Nominee Programs (PNP).',
  intakes           = 'September (Primary — widest selection), January (Secondary), May (Limited — colleges only)',
  visa_section_title = 'Canada Study Permit — Step-by-Step Journey for Nepali Students',
  required_documents = ARRAY[
    'Valid Passport (minimum 6 months validity beyond intended stay)',
    'Academic Transcripts and Certificates (Class 10, Class 12 / NEB, Bachelor''s Degree and Transcripts)',
    'IELTS Academic or PTE Academic Score Sheet',
    'Statement of Purpose (SOP)',
    'Updated Resume / CV',
    'Letters of Recommendation (2 — academic or professional)',
    'Proof of Financial Funds (tuition fee receipt + CAD 10,000 living expenses proof)',
    'PAN Card (required for tuition fee payment from Nepal)',
    'Passport-size Photographs (white background, recent)',
    'No Objection Certificate (NOC) from Nepal Ministry of Education, Science and Technology'
  ],
  entry_requirements = '{
    "ug": [
      "Minimum 3.0 GPA in NEB +2 Certificate (High School) or equivalent percentage (approx. 60%).",
      "IELTS 6.0–6.5 overall with no individual band below 6.0 (varies by institution). Diploma programs may accept IELTS 6.0 with no band below 5.5.",
      "PTE Academic 58–65 is accepted as an alternative to IELTS.",
      "Some universities require SAT/ACT scores for admission to top-tier bachelor''s programs.",
      "Duolingo English Test (DET) score of 100–115 is accepted at many Canadian colleges and universities."
    ],
    "pg": [
      "Bachelor''s degree with minimum 60% aggregate (first division) from a recognized university.",
      "IELTS 6.5 overall with no individual band below 6.0 (most universities require 6.5; some programs require 7.0).",
      "GMAT (for MBA programs) — typically 550–600+. GRE may be required for science/engineering master''s programs.",
      "2+ years of relevant work experience (required for MBA programs; preferred for professional master''s degrees).",
      "Statement of Purpose (SOP) addressing research interests and career objectives."
    ]
  }'::jsonb,
  visa_process = '[
    {"title": "Receive Your Letter of Acceptance (LOA) from a DLI", "text": "Apply to your chosen Designated Learning Institution (DLI) in Canada. All valid study permit institutions are DLIs approved by the Canadian government. After meeting admission requirements, you will receive a conditional or unconditional Letter of Acceptance (LOA). This is your primary document for the study permit application."},
    {"title": "Apply for No Objection Certificate (NOC) from Nepal MOEST", "text": "All Nepali students must obtain a No Objection Certificate from the Ministry of Education, Science and Technology (MOEST) before applying for the study permit. Apply online through the MOEST portal. Required documents include your LOA, passport, academic transcripts, and sponsorship letter. Processing typically takes 7–14 business days. Transit Education assists with the complete NOC documentation."},
    {"title": "Pay Tuition Fees via PAN Card (GIC for SDS)", "text": "Pay your first semester or first year tuition fee to the Canadian institution using your PAN card through a Nepali bank. Keep the official fee payment receipt. If applying under the Student Direct Stream (SDS), you must also open a Guaranteed Investment Certificate (GIC) of CAD 20,635 with a participating Canadian bank (such as CIBC, Scotiabank, or TD). The GIC satisfies the financial proof requirement for SDS applicants."},
    {"title": "Medical Examination by IRCC-Approved Panel Physician", "text": "Undergo a mandatory immigration medical examination (IME) with an IRCC-approved panel physician in Nepal. In Kathmandu, approved physicians are listed on the IRCC website. The medical exam typically includes a physical examination, blood tests, and a chest X-ray. Results are uploaded directly to IRCC by the physician. This must be done before submitting your visa application."},
    {"title": "Submit Study Permit Application & Biometrics", "text": "Submit your Study Permit (Temporary Resident Visa + Study Permit) application online through the IRCC portal. Upload all documents: LOA, NOC, tuition receipt/GIC, passport, IELTS/PTE scores, SOP, financial documents, and medical results. After submission, you will receive a Biometric Collection Request — attend a VFS Global center in Kathmandu to provide fingerprints and photo. Processing time is 8–16 weeks for non-SDS and approximately 20 calendar days for SDS-eligible applicants."}
  ]'::jsonb,
  meta_title        = 'Study in Canada from Nepal | Study Permit, PGWP & PR Path — Transit Education',
  meta_description  = 'Complete guide to studying in Canada from Nepal. Canada Study Permit, SDS vs non-SDS, PGWP work rights, and pathway to Canadian Permanent Residency for Nepali students.'
WHERE id = 'canada';

-- ============================================================
-- STEP 4: USA
-- ============================================================
UPDATE countries SET
  hero_title        = 'Study in the USA',
  why_study         = 'The United States is home to the world''s highest concentration of top-ranked universities — including 17 of the global top 20 — and offers unmatched academic flexibility, research opportunities, and career prospects.',
  tagline           = 'Academic Excellence, Research Leadership & OPT Work Rights',
  feature1_title    = 'World-Leading Research Universities',
  feature1_desc     = 'The US is home to Harvard, MIT, Stanford, Caltech, and 17 of the QS Top 20 universities. American degrees are recognized as the gold standard by employers and institutions globally.',
  feature2_title    = 'OPT: Work Up to 3 Years After Graduation',
  feature2_desc     = 'All F-1 students are eligible for 12 months of Optional Practical Training (OPT) after graduation. STEM degree holders can extend for an additional 24 months — a total of 36 months of US work experience.',
  intakes           = 'August/September (Fall — Primary, widest selection), January (Spring — Secondary), June (Summer — select programs only)',
  visa_section_title = 'F-1 Student Visa Journey for Nepali Students',
  required_documents = ARRAY[
    'Valid Passport (minimum 6 months validity)',
    'I-20 Form (Certificate of Eligibility) — issued by the US institution after admission',
    'Academic Transcripts and Certificates (Class 10, Class 12/NEB, Bachelor''s Degree)',
    'IELTS Academic, TOEFL iBT, or Duolingo English Test Score Sheet',
    'SAT/ACT Scores (for undergraduate admission to most universities)',
    'GRE/GMAT Scores (for postgraduate/MBA programs)',
    'Statement of Purpose (SOP) / Personal Essay',
    'Letters of Recommendation (typically 2–3 academic/professional)',
    'Financial Support Documents (bank statement showing USD 30,000–60,000 per year)',
    'Proof of SEVIS Fee Payment (USD 350 — paid before visa appointment)',
    'DS-160 Confirmation Page (online nonimmigrant visa application)',
    'Passport-size Photographs (US visa photo specifications)'
  ],
  entry_requirements = '{
    "ug": [
      "Completion of 12 years of schooling (NEB +2 Certificate). Some universities require a foundation year or additional coursework.",
      "SAT score (typically 1100–1500 depending on university selectivity). Many universities have now made SAT optional — check individual requirements.",
      "TOEFL iBT 61–100 or IELTS 6.0–7.0 (varies significantly by institution — community colleges typically require lower scores than research universities).",
      "GPA: Generally 3.0+ on a 4.0 scale (approximately 60%+ in NEB). Top universities require 3.7+.",
      "Extracurricular activities, community service, and leadership experience are considered for holistic admissions at selective universities."
    ],
    "pg": [
      "Bachelor''s degree from a recognized university with a strong academic record (GPA 3.0+ / 60%+ aggregate for most programs; 3.5+ for competitive programs).",
      "GRE General Test: Typically 300–320 combined score (Verbal + Quantitative). Some programs have waived GRE requirements post-COVID.",
      "GMAT: 550–700+ for MBA programs (top business schools require 700+).",
      "TOEFL iBT 80–100 or IELTS 6.5–7.5 (most research universities require TOEFL 90+ or IELTS 7.0+).",
      "2–5 years of relevant work experience (required for MBA; preferred for professional master''s programs).",
      "Strong Statement of Purpose, 3 Letters of Recommendation, and a detailed Resume/CV."
    ]
  }'::jsonb,
  visa_process = '[
    {"title": "Receive Admission & I-20 from a SEVP-Certified School", "text": "Apply to and receive admission from a US institution certified by the Student and Exchange Visitor Program (SEVP). After accepting your offer and paying the enrollment deposit, the institution will issue your Form I-20 (Certificate of Eligibility for Nonimmigrant Student Status). The I-20 contains your SEVIS ID number and is essential for all subsequent visa steps."},
    {"title": "Pay SEVIS Fee (USD 350) and Apply for NOC", "text": "Pay the SEVIS I-901 fee of USD 350 online at the FMJfee.com website. Keep the payment receipt — you will need it for your visa appointment. Simultaneously, apply for your No Objection Certificate (NOC) from Nepal''s Ministry of Education, Science and Technology (MOEST). The NOC is a Nepal-specific requirement for all students going abroad for higher studies."},
    {"title": "Complete DS-160 Online Visa Application", "text": "Complete the DS-160 Nonimmigrant Visa Application form online at the US Department of State website (ceac.state.gov). This comprehensive form collects your personal information, travel history, US contacts, study plans, and financial information. After completing, print your DS-160 confirmation page with barcode — this is required at your visa interview."},
    {"title": "Schedule & Attend Visa Interview at US Embassy Kathmandu", "text": "Schedule your F-1 student visa appointment through the US Embassy Kathmandu website (np.usembassy.gov). The Embassy is located in Maharajgunj, Kathmandu. At the interview, bring: passport, DS-160 confirmation, I-20, SEVIS fee receipt, IELTS/TOEFL score, admission letter, financial documents, and academic transcripts. The visa officer will ask about your study plans, financial capacity, and ties to Nepal. Transit Education conducts comprehensive mock interview preparation sessions."},
    {"title": "Visa Stamping & Pre-Departure Preparation", "text": "If approved, your F-1 visa will be stamped in your passport within 2–5 business days. You can enter the US up to 30 days before your program start date as listed on your I-20. Before departure, Transit Education provides a pre-departure briefing covering US airport arrival procedures, bank account setup, Social Security Number process, on-campus vs off-campus housing, and cultural adjustment tips."}
  ]'::jsonb,
  meta_title        = 'Study in the USA from Nepal | F-1 Visa, OPT & Scholarships — Transit Education',
  meta_description  = 'Complete guide to studying in the USA from Nepal. F-1 student visa process, SEVIS fee, DS-160, OPT work rights, and Fulbright scholarship information for Nepali students.'
WHERE id = 'usa';

-- ============================================================
-- STEP 5: UK
-- ============================================================
UPDATE countries SET
  hero_title        = 'Study in the United Kingdom',
  why_study         = 'The UK is home to Oxford, Cambridge, Imperial, and UCL — four of the world''s top 10 universities — and offers one of the most efficient routes to a globally recognized degree, with most master''s programs completed in just one year.',
  tagline           = 'Academic Heritage, 1-Year Masters & Graduate Route Work Visa',
  feature1_title    = '1-Year Master''s — Save Time & Money',
  feature1_desc     = 'Most UK master''s programs are completed in just 12 months, compared to 2 years in the US, Canada, and Australia. This saves a full year of tuition fees and living costs while delivering an equally recognized qualification.',
  feature2_title    = 'Graduate Route — 2 Years Post-Study Work',
  feature2_desc     = 'After completing a UK degree, international students can apply for the Graduate Route visa, allowing 2 years (3 years for PhD graduates) of work in the UK at any skill level. No job offer is required to apply.',
  intakes           = 'September/October (Primary — almost all programs available), January/February (Secondary — select programs), April (Limited — mainly foundation and language courses)',
  visa_section_title = 'UK Student Visa (Student Route) — Step-by-Step Journey',
  required_documents = ARRAY[
    'Valid Passport (minimum 6 months validity — ideally valid for full course duration)',
    'CAS (Confirmation of Acceptance for Studies) Number — issued by UK institution after offer and deposit payment',
    'Academic Transcripts and Certificates (Class 10, Class 12/NEB, Bachelor''s Degree and Transcripts)',
    'IELTS for UKVI Academic Score (minimum 5.5–7.0 depending on course and institution)',
    'Statement of Purpose (SOP) / Personal Statement',
    'Letters of Recommendation (2 — usually required by universities, not UKVI)',
    'Proof of Financial Maintenance Funds — Bank statement showing funds held for 28 consecutive days (Outside London: GBP 1,334/month; up to 9 months max = GBP 12,006)',
    'Tuberculosis (TB) Test Results from a UKVI-approved clinic (mandatory for Nepal)',
    'Passport-size Photographs (UK visa photo specifications)',
    'ATAS Certificate (Academic Technology Approval Scheme) — required for specific sensitive subjects'
  ],
  entry_requirements = '{
    "ug": [
      "Completion of NEB +2 (12 years of schooling). Most UK universities accept NEB without a foundation year; some may require A-levels or a foundation program.",
      "IELTS Academic (for UKVI) 5.5–7.0 overall (varies by institution and course level). Russell Group universities typically require 6.5–7.0; post-92 universities may accept 5.5–6.0.",
      "Minimum 55%–65% aggregate in NEB +2 (varies by institution tier and course).",
      "PTE Academic for UKVI is accepted as an alternative (score range 42–65+ depending on institution).",
      "Duolingo English Test is accepted at a growing number of UK universities (score 95–120 typically)."
    ],
    "pg": [
      "Bachelor''s degree with minimum 55%–60% aggregate (Second Class Lower / 2:2 equivalent). Top universities (Russell Group) require 60%–70% (2:1 equivalent).",
      "IELTS Academic (for UKVI) 6.0–7.0 overall with no individual band below 5.5–6.0. Standard requirement for taught master''s is 6.5.",
      "Relevant work experience (1–3 years required for MBA programs at most business schools).",
      "GMAT: 550–680+ for MBA programs. GRE accepted at some universities as alternative.",
      "Research Proposal (required for MPhil/PhD and research master''s programs — must align with supervisor''s research area)."
    ]
  }'::jsonb,
  visa_process = '[
    {"title": "Receive CAS (Confirmation of Acceptance for Studies)", "text": "After receiving your unconditional offer and paying the required tuition deposit, your UK institution will issue your CAS (Confirmation of Acceptance for Studies) number — a 14-character reference number. Your CAS is valid for 6 months from the date of issue. It contains your course details, institution, start date, and financial requirements. You cannot apply for your Student visa without a CAS."},
    {"title": "Complete Mandatory TB Test at a UKVI-Approved Clinic in Nepal", "text": "Nepal is on the UK''s list of countries requiring a tuberculosis (TB) test for visa applicants. You must attend a UKVI-approved clinic in Kathmandu for a chest X-ray and TB test. Approved clinics include IOM (International Organization for Migration) and selected government hospitals. Results are usually ready within 3–5 business days and are submitted directly to the UK Home Office. This certificate is required with your visa application and is valid for 6 months."},
    {"title": "Apply for No Objection Certificate (NOC) from Nepal MOEST", "text": "Nepali students must obtain a No Objection Certificate from the Ministry of Education, Science and Technology (MOEST) before submitting their UK Student visa application. Apply online through the MOEST portal with your CAS, offer letter, passport, and academic documents. Processing takes 7–14 business days. Transit Education provides full assistance with the NOC application process."},
    {"title": "Submit Online UK Student Visa Application", "text": "Apply online at the UK Visas and Immigration (UKVI) website. The application fee is GBP 490 (approximately NPR 83,000) plus the Immigration Health Surcharge (IHS) — currently GBP 776 per year of study. You will upload your CAS details, passport, financial documents, TB test results, academic transcripts, IELTS scores, and SOP. Biometrics are collected at VFS Global in Kathmandu at your appointment."},
    {"title": "Attend Biometric Appointment & Receive Visa Decision", "text": "Attend your biometric appointment at VFS Global in Kathmandu (Jawalakhel or Thamel centres). Provide fingerprints, photograph, and submit your supporting documents. UK Student visa decisions are typically received within 3 weeks for applications outside the UK. Priority service (additional fee) can reduce processing to 5 business days. Once approved, you will receive a vignette sticker in your passport valid for 30 days for entry, and collect your BRP (Biometric Residence Permit) within 10 days of arriving in the UK."}
  ]'::jsonb,
  meta_title        = 'Study in the UK from Nepal | Student Visa, CAS & Graduate Route — Transit Education',
  meta_description  = 'Complete guide to studying in the UK from Nepal. UK Student visa (Student Route), CAS number, TB test, IHS surcharge, Chevening scholarship, and Graduate Route visa for Nepali students.'
WHERE id = 'uk';

-- ============================================================
-- STEP 6: GERMANY (expand existing entry)
-- ============================================================
UPDATE countries SET
  hero_title        = 'Study in Germany',
  why_study         = 'Germany is Europe''s largest economy and one of the most affordable study destinations in the world — most public universities charge zero tuition fees for international students, including Nepali students.',
  tagline           = 'Zero Tuition Fees, World-Class Engineering & DAAD Scholarships',
  feature1_title    = 'Free Education at Public Universities',
  feature1_desc     = 'Most German public universities charge no tuition fees — only a semester contribution of €150–€350 per semester covering admin fees and a public transport pass. This makes Germany one of the most cost-effective quality education destinations in the world.',
  feature2_title    = '18-Month Post-Study Work Visa',
  feature2_desc     = 'After graduating from a German university, international students can apply for an 18-month Job Seeker visa to find employment in Germany. Once employed, you can apply for a German Work Permit and eventually permanent residency (PR) after 2 years of skilled work.',
  intakes           = 'October/November (Winter Semester — Primary for most programs), April/May (Summer Semester — Secondary, fewer programs available)',
  visa_section_title = 'German Student Visa (National D Visa) — Step-by-Step Journey for Nepali Students',
  required_documents = ARRAY[
    'Valid Passport (minimum 6 months validity)',
    'APS Certificate (Akademische Prüfstelle) — MANDATORY for Nepali students',
    'Academic Transcripts and Certificates (Class 10, Class 12 / NEB, Bachelor''s Degree — all officially translated into German or English)',
    'University Admission Letter (Zulassung)',
    'German Language Proficiency Certificate (for German-taught programs): TestDaF TDN 4 or DSH-2 or Goethe C1',
    'English Language Proficiency Certificate (for English-taught programs): IELTS 6.0–6.5 or TOEFL iBT 72–90',
    'Statement of Purpose / Motivation Letter',
    'Letters of Recommendation (2 — academic)',
    'Blocked Account (Sperrkonto) — €11,904 (for 2026) via Deutsche Bank, Expatrio, Coracle, or Fintiba',
    'Proof of Health Insurance (valid German or international health insurance recognized in Germany)',
    'Passport-size Photographs (German visa photo specifications)',
    'CV / Resume'
  ],
  entry_requirements = '{
    "ug": [
      "Completion of 12 years of schooling (NEB +2) PLUS a minimum of 2 years of further study at a Nepali university (Bachelor''s first 2 years). German universities typically require 13 years of pre-university education — Nepal''s 12-year system creates a year gap that must be fulfilled by completing 2 years of a Bachelor''s in Nepal or enrolling in a Studienkolleg (foundation year) in Germany.",
      "Minimum 65%–70% aggregate in both NEB +2 and completed university years.",
      "APS Certificate (mandatory for all Nepali applicants — see visa steps for APS process).",
      "German language proficiency: TestDaF TDN 4+ or DSH-2 for German-taught programs. IELTS 6.0–6.5 or TOEFL iBT 72–90 for English-taught programs.",
      "Relevant math and science background for engineering and STEM programs."
    ],
    "pg": [
      "Completed Bachelor''s degree (4 years) from a recognized Nepali university with minimum 60%–65% aggregate. Some top universities require 70%+.",
      "APS Certificate (mandatory — must be obtained before applying to any German university).",
      "Relevant bachelor''s degree in the same or closely related field as the chosen master''s program.",
      "German language: TestDaF TDN 4 or DSH-2 for German-taught master''s. IELTS 6.5 or TOEFL iBT 80–90 for English-taught master''s programs.",
      "GRE may be required for some competitive engineering and science master''s programs.",
      "Strong portfolio or work samples required for Architecture, Design, and Fine Arts programs."
    ]
  }'::jsonb,
  visa_process = '[
    {"title": "Obtain APS Certificate (Academic Credential Assessment)", "text": "The APS (Akademische Prüfstelle) Certificate is mandatory for all Nepali applicants to German universities. The APS is operated by the German Embassy in Kathmandu and verifies the authenticity of your academic qualifications. Steps: (1) Register on the APS Nepal portal (aps-nepal.de), (2) Submit original academic certificates (Class 10, Class 12/NEB, and university transcripts), (3) Attend a short academic interview at the German Embassy in Kathmandu, (4) Receive your APS certificate. Processing takes 4–8 weeks. Fee: approximately NPR 15,000–20,000. Without the APS Certificate, German universities will not process your application."},
    {"title": "Apply to German University via uni-assist or Directly", "text": "Many German universities accept applications through the centralized portal uni-assist (uni-assist.de) — an online application management system for international students. Some universities (like TU Munich, Heidelberg, LMU Munich) accept direct applications through their own portals. Apply with your APS Certificate, academic transcripts, language certificates, motivation letter, and CV. For English-taught master''s programs, search the DAAD database (daad.de) for fully English-medium programs. Apply 6–9 months before your intended intake."},
    {"title": "Open a German Blocked Account (Sperrkonto)", "text": "A Blocked Account (Sperrkonto) with a fixed deposit of €11,904 (2026 requirement — equivalent to €992/month for 12 months) is mandatory for your visa application. Open it online from Nepal through: Expatrio (recommended — fastest), Fintiba, Coracle, or Deutsche Bank. Funds are released monthly once you arrive in Germany (€992/month). Processing takes 5–10 business days."},
    {"title": "Apply for NOC & Collect All Documents", "text": "Apply for your No Objection Certificate (NOC) from Nepal''s Ministry of Education, Science and Technology (MOEST). Simultaneously prepare all supporting documents: have your academic certificates officially translated into German or English by a certified translator, get documents notarized/apostilled by the Ministry of Foreign Affairs of Nepal, arrange health insurance, and prepare your motivation letter and visa application forms."},
    {"title": "Apply for German National Visa (D Visa) at German Embassy Kathmandu", "text": "Submit your German Student Visa (National D Visa) application at the German Embassy in Kathmandu (Gyaneshwar). Book your appointment through the German Embassy Nepal website well in advance — appointments can take 8–12 weeks. Required documents: APS Certificate, university admission letter, blocked account confirmation, NOC, health insurance proof, language certificates, passport, translated transcripts, motivation letter, and visa application form. Visa fee: €75 (approximately NPR 11,000). Processing takes 4–12 weeks after submission."}
  ]'::jsonb,
  meta_title        = 'Study in Germany from Nepal | Free Education, APS & DAAD — Transit Education',
  meta_description  = 'Complete guide to studying in Germany from Nepal. Free public university education, APS certificate process, blocked account (Sperrkonto), DAAD scholarships, and National D Visa guidance.'
WHERE id = 'germany';

-- ============================================================
-- STEP 7: DELETE old FAQs for these 5 country pages (clean slate)
-- ============================================================
DELETE FROM faqs WHERE page_path IN (
  'study-abroad/australia',
  'study-abroad/canada',
  'study-abroad/usa',
  'study-abroad/uk',
  'study-abroad/germany'
);

-- ============================================================
-- STEP 8: AUSTRALIA FAQs
-- ============================================================
INSERT INTO faqs (question, answer, category, page_path, status, is_featured, display_order) VALUES
('What is the minimum IELTS score for Australia?',
 'For most undergraduate courses, a minimum IELTS score of 6.0 overall with no individual band below 5.5 is required. For postgraduate courses, the standard requirement is 6.5 overall with no band below 6.0. Some universities and nursing or health programs require 7.0. PTE Academic is also widely accepted — typically 50 for undergraduate and 58 for postgraduate.',
 'Visa & Requirements', 'study-abroad/australia', 'published', true, 1),

('What is the GTE requirement and how do I write it?',
 'The Genuine Temporary Entrant (GTE) is a written statement explaining your genuine intent to temporarily study in Australia and return to Nepal afterwards. It should cover: your reasons for choosing Australia, your reasons for choosing your specific course and institution, your ties to Nepal (family, property, career plans), and your future career goals after graduation. Transit Education provides full GTE writing support.',
 'Visa & Requirements', 'study-abroad/australia', 'published', true, 2),

('How much money do I need to show for an Australia student visa?',
 'For 2026, the Australian Government requires you to demonstrate AUD 29,710 per year for living expenses (increased from AUD 24,505). This is in addition to your tuition fees. You must show this through bank statements, fixed deposits, or property documents. Your parents'' or sponsor''s financial documents are accepted.',
 'Finance', 'study-abroad/australia', 'published', false, 3),

('Can I work in Australia while studying?',
 'Yes. Since July 2023, the working hour restriction for international students has been removed — you can now work unlimited hours during your studies (previously capped at 48 hrs/fortnight). After graduation, you can apply for a Temporary Graduate visa (Subclass 485) for 2–6 years of post-study work rights depending on your qualification level and study location.',
 'Work Rights', 'study-abroad/australia', 'published', false, 4),

('What are the intake months for Australia?',
 'Australia has two main intakes: February (Semester 1 — primary, widest course selection) and July (Semester 2 — secondary, most courses available). Some TAFE and private colleges also offer a November/December intake under a trimester system. Transit Education recommends the February intake for first-time applicants as it offers the most university and course options.',
 'Admissions', 'study-abroad/australia', 'published', false, 5),

('What is the cost of studying in Australia?',
 'Tuition costs vary by institution and level: VET/TAFE courses AUD 4,000–22,000 per year; Undergraduate Bachelor''s AUD 20,000–45,000 per year; Postgraduate Master''s AUD 22,000–50,000 per year; MBA AUD 35,000–60,000 per year. Living costs are approximately AUD 1,500–2,500 per month depending on the city. Sydney and Melbourne are the most expensive; Brisbane, Adelaide, and Perth are more affordable.',
 'Finance', 'study-abroad/australia', 'published', false, 6),

('What scholarships are available for Nepali students in Australia?',
 'Several scholarships are available: (1) Australia Awards Scholarships — fully funded by the Australian Government covering tuition, living allowance, and airfare; (2) Destination Australia Scholarship — up to AUD 15,000/year for studying in regional Australia; (3) University-specific merit scholarships ranging from 10%–50% tuition reduction at institutions like Macquarie University, Deakin, and Griffith; (4) RTP (Research Training Program) for PhD students covering fees and stipend. Transit Education identifies applicable scholarships for your profile during counselling.',
 'Scholarships', 'study-abroad/australia', 'published', false, 7);

-- ============================================================
-- STEP 9: CANADA FAQs
-- ============================================================
INSERT INTO faqs (question, answer, category, page_path, status, is_featured, display_order) VALUES
('How do I apply for a Canada student visa from Nepal?',
 'To apply for a Canada Study Permit from Nepal, you need: (1) An acceptance letter from a Designated Learning Institution (DLI), (2) A No Objection Certificate (NOC) from Nepal''s Ministry of Education, (3) Proof of financial funds — tuition payment receipt and living expense proof (CAD 10,000 minimum or a GIC for SDS), (4) Medical examination results, (5) IELTS or PTE scores, and (6) A valid passport. Transit Education guides you through the entire process, including NOC, SDS eligibility assessment, and document preparation.',
 'Visa & Requirements', 'study-abroad/canada', 'published', true, 1),

('What is the difference between SDS and non-SDS for Canada?',
 'The Student Direct Stream (SDS) is a faster processing pathway for applicants from eligible countries including Nepal. To qualify for SDS, you need: IELTS 6.0 in all four bands (no exceptions), a GIC of CAD 20,635, full tuition payment for year one, and a clean medical and background check. SDS applications are typically processed in 20 calendar days versus 8–16 weeks for non-SDS. Transit Education will assess your eligibility and advise on the best route.',
 'Visa & Requirements', 'study-abroad/canada', 'published', true, 2),

('What is the processing time for a Canada Study Permit from Nepal?',
 'SDS (Student Direct Stream) applications: approximately 20 calendar days if all criteria are met. Non-SDS applications: typically 8–16 weeks, though processing times can vary based on volume and seasonal demand. We recommend applying at least 3–4 months before your intended start date to allow sufficient processing time.',
 'Visa & Requirements', 'study-abroad/canada', 'published', false, 3),

('Can I bring my spouse and children to Canada while studying?',
 'Yes. Your spouse or common-law partner may be eligible for an Open Work Permit (OWP) if you are enrolled in a full-time program at a designated institution. This OWP allows them to work for any employer in Canada. Your dependent children can obtain study permits to attend school in Canada. Bring complete family documents including marriage certificate, birth certificates, and proof of relationship.',
 'Family', 'study-abroad/canada', 'published', false, 4),

('What is PGWP and how does it help Nepali students?',
 'The Post-Graduation Work Permit (PGWP) allows graduates of eligible Canadian institutions to work in Canada for a period equivalent to their study duration — up to a maximum of 3 years. For example, a 2-year diploma program gives a 2-year PGWP; a 4-year bachelor''s gives a 3-year PGWP. After gaining work experience, you can apply for Canadian Permanent Residency through Express Entry (CEC stream) or a Provincial Nominee Program (PNP). Canada is one of the most accessible PR pathways for Nepali students globally.',
 'Work Rights', 'study-abroad/canada', 'published', false, 5),

('What is the cost of studying and living in Canada?',
 'Tuition fees vary by institution type and province: College diploma programs CAD 12,000–20,000/year; Undergraduate university programs CAD 18,000–35,000/year; Postgraduate master''s CAD 16,000–40,000/year; MBA CAD 30,000–70,000/year. Living costs: approximately CAD 12,000–18,000/year depending on city. Toronto and Vancouver are the most expensive; cities like Winnipeg, Halifax, and Saskatoon are significantly more affordable.',
 'Finance', 'study-abroad/canada', 'published', false, 6),

('What scholarships are available for Nepali students in Canada?',
 'Key scholarships include: (1) Vanier Canada Graduate Scholarships — CAD 50,000/year for PhD students (highly competitive); (2) University-specific entrance scholarships ranging from CAD 2,000–15,000 based on academic merit; (3) Province-specific scholarships such as Ontario Graduate Scholarship; (4) Institution-specific awards — University of Manitoba, University of Regina, and many others offer automatic consideration for merit awards on admission. Many colleges also offer in-study bursaries. Transit Education identifies applicable scholarships for your profile during the counselling process.',
 'Scholarships', 'study-abroad/canada', 'published', false, 7);

-- ============================================================
-- STEP 10: USA FAQs
-- ============================================================
INSERT INTO faqs (question, answer, category, page_path, status, is_featured, display_order) VALUES
('How much money do I need to show for a USA student visa?',
 'You must demonstrate sufficient funds to cover at least the first year of study as stated on your I-20. This typically ranges from USD 30,000–60,000 depending on the university and location. Funds can be demonstrated through: personal savings (bank statement with 3–6 months history), parents''/sponsors'' bank statements, property valuations, fixed deposits, or a combination. A financial affidavit from your sponsor may also be required.',
 'Finance', 'study-abroad/usa', 'published', true, 1),

('Does the USA allow work while studying?',
 'F-1 students can work on-campus up to 20 hours per week during the semester and full-time during official breaks. Off-campus work is generally not permitted during the first year. After one academic year, you may be eligible for Curricular Practical Training (CPT) for internships directly related to your field. After graduation, Optional Practical Training (OPT) allows 12 months of work; STEM graduates can extend for 24 additional months for a total of 36 months.',
 'Work Rights', 'study-abroad/usa', 'published', true, 2),

('What is the F-1 visa interview like at the US Embassy in Kathmandu?',
 'The F-1 visa interview at the US Embassy in Maharajgunj, Kathmandu, is typically brief — 3 to 5 minutes. The visa officer will ask questions such as: Why did you choose this university and program? Who is funding your studies? What will you do after graduation? Do you have ties to Nepal? The key is to demonstrate genuine academic intent, clear funding, and strong ties to Nepal showing your intention to return after studies. Transit Education provides full mock interview preparation tailored to the US Embassy''s typical questions.',
 'Visa & Requirements', 'study-abroad/usa', 'published', false, 3),

('What is OPT and how does it benefit Nepali students?',
 'Optional Practical Training (OPT) is a US government program allowing F-1 students to work in the US for up to 12 months after completing their degree. STEM (Science, Technology, Engineering, Mathematics) graduates can apply for a 24-month STEM OPT extension, giving a total of 36 months. During OPT, many students secure H-1B employer sponsorship and transition to long-term US residency. OPT is one of the most valuable post-study benefits of studying in the US.',
 'Work Rights', 'study-abroad/usa', 'published', false, 4),

('What is the cost of studying in the USA?',
 'Tuition costs vary enormously: Community colleges USD 6,000–20,000/year (excellent pathway to university transfer); State (public) universities USD 18,000–35,000/year for out-of-state international students; Private universities USD 35,000–60,000/year; Top private universities (Harvard, MIT, etc.) USD 55,000–80,000/year. Living costs range from USD 10,000–20,000/year depending on city. New York, San Francisco, and Boston are the most expensive. Smaller university towns in the Midwest and South are significantly more affordable.',
 'Finance', 'study-abroad/usa', 'published', false, 5),

('What scholarships are available for Nepali students in USA?',
 'US scholarships include: (1) Fulbright Foreign Student Program — fully funded scholarship for master''s and PhD students from Nepal (highly competitive, apply through USEF Nepal); (2) University-specific merit scholarships — many universities offer 20%–100% tuition waivers for outstanding international students; (3) Graduate Assistantships (Teaching/Research) — cover tuition + monthly stipend for PhD and master''s students; (4) Community college foundation scholarships; (5) Private scholarships through organizations like Aga Khan Foundation. Discuss your profile with Transit Education to identify your best scholarship options.',
 'Scholarships', 'study-abroad/usa', 'published', false, 6);

-- ============================================================
-- STEP 11: UK FAQs
-- ============================================================
INSERT INTO faqs (question, answer, category, page_path, status, is_featured, display_order) VALUES
('Can I work in the UK while studying?',
 'Yes. International students on a UK Student visa enrolled at a Higher Education Institution (university) can work up to 20 hours per week during term time and full-time during official vacations and between semesters. Students at Further Education institutions (colleges) can work up to 10 hours per week. You may also undertake a work placement or internship if it is an assessed part of your course.',
 'Work Rights', 'study-abroad/uk', 'published', true, 1),

('What is the Immigration Health Surcharge (IHS)?',
 'The Immigration Health Surcharge (IHS) gives international students access to the NHS (National Health Service) in the UK — the same healthcare access as UK residents. The current rate is GBP 776 per year of study. For a 1-year master''s, you pay approximately GBP 776; for a 3-year bachelor''s, approximately GBP 2,328. This is paid upfront as part of your visa application.',
 'Finance', 'study-abroad/uk', 'published', true, 2),

('Do I need a bank balance certificate for the UK visa?',
 'Yes. You must show that you have sufficient maintenance funds held consecutively for 28 days prior to your visa application. The required amount is GBP 1,334 per month, for up to 9 months of the course duration. For a 1-year master''s: GBP 1,334 × 9 = GBP 12,006 (outside London). Your bank statement must be dated within 31 days of your application date, and the required funds must have been present in your account for the entire 28-day period.',
 'Finance', 'study-abroad/uk', 'published', false, 3),

('What is the Graduate Route visa?',
 'The Graduate Route visa allows international students who graduate from an eligible UK institution to remain and work (or look for work) in the UK for 2 years after graduation (3 years for PhD graduates). No job offer is required to apply. You can work at any skill level — full-time or part-time — for any employer. During this period, many graduates secure skilled worker visa sponsorship from employers and transition to longer-term UK residency.',
 'Work Rights', 'study-abroad/uk', 'published', false, 4),

('What scholarships are available for Nepali students in the UK?',
 'Key scholarships include: (1) Chevening Scholarship — fully funded by the UK Government for 1-year master''s programs; applications open in August each year through the British Embassy Kathmandu; (2) GREAT Scholarships Nepal — partial scholarships (GBP 10,000) awarded by UK universities in partnership with the British Council; (3) Commonwealth Scholarships — for students from Commonwealth countries including Nepal; (4) University-specific merit scholarships — institutions like University of Bristol, University of Glasgow, Nottingham, and many others offer 20%–50% tuition fee waivers; (5) Research council funding (UKRI) for PhD students. Transit Education will review your profile and identify applicable scholarship opportunities.',
 'Scholarships', 'study-abroad/uk', 'published', false, 5);

-- ============================================================
-- STEP 12: GERMANY FAQs
-- ============================================================
INSERT INTO faqs (question, answer, category, page_path, status, is_featured, display_order) VALUES
('Do I need to know German to study in Germany?',
 'Not necessarily. Germany has a rapidly growing number of English-taught master''s programs (700+ programs listed on the DAAD database). However, for undergraduate programs at public universities, most courses are taught in German and require TestDaF TDN 4 or DSH-2 level proficiency. Even for English-taught programs, basic German (A1/A2 Goethe certificate) is highly recommended for daily life, part-time jobs, and internships.',
 'General', 'study-abroad/germany', 'published', true, 1),

('Is it really free to study at German universities?',
 'Yes — most German public universities charge no tuition fees for international students, including students from Nepal. You only pay a semester contribution (Semesterbeitrag) of €150–€350 per semester, which typically includes a semester transport pass (free public transport in the city), student union fees, and administrative costs. Private universities in Germany do charge tuition fees (€5,000–€20,000/year) but these are the minority. The key is choosing a public university (Universität or Fachhochschule/University of Applied Sciences).',
 'Finance', 'study-abroad/germany', 'published', true, 2),

('What is the APS Certificate and how long does it take?',
 'The APS (Akademische Prüfstelle) Certificate is a mandatory academic credential verification document issued by the German Embassy in Kathmandu specifically for Nepali applicants. The APS office reviews your original academic documents, conducts a brief academic interview, and issues a certificate confirming the authenticity of your qualifications. The entire process takes 4–8 weeks and costs approximately NPR 15,000–20,000. You must obtain the APS Certificate before applying to any German university — without it, your application will not be accepted.',
 'Visa & Requirements', 'study-abroad/germany', 'published', false, 3),

('What is a Blocked Account (Sperrkonto) and how much do I need?',
 'A Blocked Account (Sperrkonto) is a special German bank account where you deposit €11,904 (2026 requirement) before your visa application. This amount represents 12 months of living costs (€992/month) as required by German immigration. After arriving in Germany, €992 is released to you each month from the blocked account. You can open a Sperrkonto online from Nepal through providers like Expatrio, Fintiba, or Coracle. The process takes 5–10 business days.',
 'Finance', 'study-abroad/germany', 'published', false, 4),

('What scholarships are available for Nepali students in Germany?',
 'Key scholarships include: (1) DAAD Scholarships (Deutscher Akademischer Austauschdienst) — Germany''s most prestigious scholarship for postgraduate and doctoral students; covers full tuition, monthly stipend of €850–€1,200, health insurance, and travel allowance; apply through daad.de; (2) Deutschlandstipendium — merit-based scholarship of €300/month co-funded by the German government and private sponsors; (3) Heinrich Böll Foundation, Konrad Adenauer Foundation, Friedrich Ebert Foundation scholarships — for politically engaged and high-achieving students; (4) Erasmus+ for exchange students. Transit Education identifies the most suitable scholarship for your profile.',
 'Scholarships', 'study-abroad/germany', 'published', false, 5),

('What is the cost of living in Germany?',
 'Typical monthly costs: Accommodation €300–€700 (student dormitories €200–€350/month are cheapest — apply early through the Studentenwerk); Food and groceries €200–€300; Health insurance €110–€130 (mandatory for all students); Public transport covered by semester contribution; Phone €10–€20; Entertainment and miscellaneous €100–€200. Total estimated monthly living cost: €800–€1,300 depending on city. Munich and Frankfurt are most expensive; cities like Leipzig, Dresden, Chemnitz, and Magdeburg are significantly more affordable.',
 'Finance', 'study-abroad/germany', 'published', false, 6),

('Can I work while studying in Germany?',
 'Yes. International students in Germany can work 120 full days or 240 half-days per year without a work permit. Most students work 20 hours per week during the semester. Germany has a minimum wage of €12.41 per hour, which means students can earn €400–€800/month part-time. After graduation, the 18-month Job Seeker visa allows you to stay and find employment. Once employed, you can apply for a German work permit and — after 2–4 years of skilled work — permanent residency (Niederlassungserlaubnis).',
 'Work Rights', 'study-abroad/germany', 'published', false, 7);
