import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Metadata } from "next";
import SectionLabel from "@/components/shared/SectionLabel";
import FAQAccordion from "@/components/shared/FAQAccordion";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";

// ─── Static sub-page content (used when DB fields not yet populated) ───────────

const VISA_CONTENT: Record<string, { title: string; intro: string; steps: { title: string; text: string }[]; docs: string[]; tips: string[] }> = {
  canada: {
    title: "Canada Student Visa (Study Permit) from Nepal",
    intro: "The Canada Student Permit allows international students to study at Designated Learning Institutions (DLIs) in Canada. Nepali students can apply through the SDS (Student Direct Stream) for faster processing.",
    steps: [
      { title: "Receive Offer / Acceptance Letter", text: "You must have an acceptance letter from a DLI in Canada before applying for a study permit." },
      { title: "Obtain NOC from Nepal MOE", text: "Apply for No Objection Certificate (NOC) from Nepal Ministry of Education. Required for all Nepali students going abroad." },
      { title: "Get IELTS / PTE Score", text: "SDS requires minimum IELTS 6.0 (no band below 6.0). Non-SDS accepts IELTS 6.0+ with wider bank statement requirements." },
      { title: "Open GIC (Guaranteed Investment Certificate)", text: "SDS requires a GIC of CA$10,000 from a designated Canadian bank (Scotiabank, CIBC, etc.). Non-SDS requires bank statements showing 12 months of funds." },
      { title: "Gather Documents & Apply Online", text: "Apply via IRCC (Immigration, Refugees and Citizenship Canada) online portal. Upload: offer letter, passport, IELTS, GIC, bank statements, SOP, NOC, photos." },
      { title: "Biometrics", text: "After submitting your application, you will receive a biometrics request. Visit a VAC (Visa Application Centre) in Kathmandu to provide fingerprints and photo." },
      { title: "Receive Study Permit", text: "SDS processing: 20–25 working days. Non-SDS: 8–12 weeks. A study permit letter (PoR) is issued — the actual visa is stamped at the port of entry." },
    ],
    docs: ["Acceptance letter from DLI", "Valid passport", "IELTS / PTE score report", "GIC confirmation (SDS) or bank statements", "NOC from Nepal MOE", "Statement of Purpose (SOP)", "Educational transcripts", "Medical examination (if required)", "Biometrics"],
    tips: ["Apply SDS for faster processing (20–25 days vs 8+ weeks)", "Your SOP must clearly explain your intent to return to Nepal after graduation", "Ensure no band below 6.0 in IELTS for SDS", "Book your GIC early — it takes 2–3 weeks to process"],
  },
  australia: {
    title: "Australia Student Visa (Subclass 500) from Nepal",
    intro: "The Australian Student Visa (Subclass 500) is required for studying in Australia for more than 3 months. Processing is done through the Department of Home Affairs (DHA) online portal.",
    steps: [
      { title: "Receive Confirmation of Enrolment (CoE)", text: "Apply to Australian universities/colleges and receive your CoE letter after paying the deposit or full fees." },
      { title: "Purchase OSHC (Health Cover)", text: "Overseas Student Health Cover is mandatory. Purchase from Bupa, nib, Medibank, or AHM for the entire duration of your visa." },
      { title: "Create ImmiAccount", text: "Create an account at immi.homeaffairs.gov.au to apply online. All applications are submitted digitally — no paper applications." },
      { title: "Submit Visa Application", text: "Upload: CoE, OSHC, IELTS/PTE scores, financial evidence (3 months bank statements showing AUD 21,041/year), passport, SOP." },
      { title: "Biometrics & Health Exam", text: "You may be asked to complete a medical examination at an approved DHA panel physician in Kathmandu and/or biometrics." },
      { title: "Receive Grant Notice", text: "Visa grant notice emailed with visa validity dates. Processing: typically 4–6 weeks but can vary." },
    ],
    docs: ["CoE from Australian institution", "Valid passport", "IELTS / PTE / TOEFL score report", "Genuine Temporary Entrant (GTE) statement (SOP)", "Financial evidence (AUD 21,041/year minimum)", "OSHC purchase confirmation", "Academic transcripts", "Medical examination results (if requested)"],
    tips: ["GTE statement (your SOP) is critical — visa officers assess genuine study intent", "Financial evidence must be clearly accessible (no fixed deposits)", "Apply as early as possible — processing times vary widely", "Work rights: 48 hours/fortnight during semester, unlimited during holidays"],
  },
  uk: {
    title: "UK Student Visa (Student Route) from Nepal",
    intro: "The UK Student Visa (formerly Tier 4) is required for studying in the UK for over 6 months. You need a Confirmation of Acceptance for Studies (CAS) from your university before applying.",
    steps: [
      { title: "Receive CAS from University", text: "After accepting your offer, your university will issue a CAS number. This is unique to you and must be used in your visa application." },
      { title: "Prove English Proficiency", text: "Your university handles this through a UKVI-approved IELTS or PTE score (SELT). The score must be from a centre approved for UK visa purposes." },
      { title: "Show Financial Evidence", text: "You must show: tuition balance + £1,334/month for living outside London (or £1,023 in London) for up to 9 months, held in your bank for 28 consecutive days." },
      { title: "Apply Online via UK Visas & Immigration", text: "Apply at gov.uk. Pay the visa fee (£490) and Immigration Health Surcharge (IHS — £776/year)." },
      { title: "Biometrics Appointment", text: "Visit VFS Global office in Kathmandu to submit biometrics and documents." },
      { title: "Decision", text: "Standard processing: 3 weeks. Priority (£500 extra): 5 working days. Super-priority (£800 extra): next working day." },
    ],
    docs: ["CAS number from UK university", "Valid passport", "IELTS UKVI / PTE Academic UKVI score", "28-day bank statement (tuition balance + living costs)", "Academic transcripts", "ATAS certificate (for some science/engineering subjects)", "TB test certificate (required for Nepal applicants)"],
    tips: ["TB (Tuberculosis) test is mandatory for Nepali applicants — do it at an approved clinic in Kathmandu", "IHS is paid upfront for the full visa duration — factor this into your budget", "Graduate Route Visa (2 years undergrad, 3 years postgrad) allows work without a job offer"],
  },
  usa: {
    title: "USA F-1 Student Visa from Nepal",
    intro: "The F-1 visa is required for studying full-time at US universities, colleges, or language programs. You apply at the US Embassy Kathmandu after receiving your I-20 from your institution.",
    steps: [
      { title: "Receive I-20 from US Institution", text: "After being admitted, your institution issues Form I-20 (Certificate of Eligibility). This is your primary visa document." },
      { title: "Pay SEVIS Fee", text: "Pay the SEVIS (Student and Exchange Visitor Information System) fee of $350 at fmjfee.com before scheduling your visa interview." },
      { title: "Complete DS-160 Online", text: "Fill the DS-160 (Non-Immigrant Visa Application) at ceac.state.gov. Keep the application ID — you need it for the interview." },
      { title: "Schedule Visa Interview", text: "Schedule an F-1 interview at the US Embassy Kathmandu via ustraveldocs.com. Slots can be competitive — book early." },
      { title: "Attend Visa Interview", text: "Attend the interview at the US Embassy, Maharajgunj, Kathmandu. Bring all original documents. The interviewing officer makes the decision on the spot or within days." },
      { title: "Receive Visa", text: "If approved, your passport is stamped with the F-1 visa. You can enter the US up to 30 days before your program start date." },
    ],
    docs: ["I-20 form from US institution", "Valid passport", "DS-160 confirmation page", "SEVIS fee receipt ($350)", "Interview appointment confirmation", "Financial evidence (bank statements showing full funding)", "IELTS / TOEFL / SAT / GRE / GMAT score report", "Academic transcripts"],
    tips: ["Strong interview performance matters — be confident and truthful about your ties to Nepal and intent to return", "Show clear financial evidence for the full program duration", "Community college → transfer to university is a cost-effective pathway", "OPT (Optional Practical Training) allows 12 months work after graduation; STEM fields get 36 months"],
  },
  germany: {
    title: "Germany Student Visa (National D Visa) from Nepal",
    intro: "Nepali students require a German National Visa (Type D) to study in Germany. The APS certificate is a mandatory first step unique to students from Nepal and certain other countries.",
    steps: [
      { title: "Obtain APS Certificate", text: "Apply for APS (Academic Evaluation Centre) verification at the German Embassy Kathmandu. Required for all Nepali students. Processing: 4–8 weeks." },
      { title: "Apply to University", text: "Apply via the university website or uni-assist. Winter semester (October): apply by May–June. Summer semester (April): by November–January." },
      { title: "Open Blocked Account (Sperrkonto)", text: "Deposit €11,208 into a German blocked account (Sperrkonto) via Fintiba, Expatrio, or Deutsche Bank. This money is released monthly after arrival." },
      { title: "Purchase Health Insurance", text: "German public health insurance (TK, AOK, Barmer) costs approximately €110/month for students under 30. Required for visa." },
      { title: "Submit National D Visa Application", text: "Apply at German Embassy Kathmandu with all documents. Pay visa fee €75. Processing: 6–12 weeks." },
      { title: "Arrive & Register", text: "Upon arrival, register at your local Einwohnermeldeamt (resident registration office) within 2 weeks. Enroll at university and register with health insurance." },
    ],
    docs: ["APS certificate", "University admission letter (Zulassungsbescheid)", "Blocked account confirmation (€11,208)", "Valid passport", "Language certificate (TestDaF / IELTS / TOEFL)", "Health insurance proof", "Academic transcripts & certificates", "Biometric passport photos"],
    tips: ["Start APS process 6+ months before your intended intake — it takes 4–8 weeks and is mandatory", "Most public universities charge zero tuition — only semester fee €100–€350", "18-month job seeker visa available after graduation", "Register at local authorities (Einwohnermeldeamt) within 2 weeks of arrival"],
  },
  "new-zealand": {
    title: "New Zealand Student Visa from Nepal",
    intro: "The New Zealand Student Visa allows Nepali students to study full-time at New Zealand institutions. Applications are submitted online through Immigration New Zealand.",
    steps: [
      { title: "Receive Offer of Place", text: "Apply to a New Zealand institution and receive an unconditional offer letter confirming your admission." },
      { title: "Pay Tuition Deposit", text: "Pay the required deposit to the institution. You will receive a receipt confirming payment." },
      { title: "Apply for Student Visa Online", text: "Apply at immigration.govt.nz. Provide offer letter, financial evidence, passport, medical/character certificates." },
      { title: "Medical & X-Ray (if required)", text: "Students from certain countries or staying over 12 months may need a chest X-ray and/or medical examination from an approved physician." },
      { title: "Receive Visa Decision", text: "Processing takes 15–35 working days online. Visa is electronically linked to your passport." },
    ],
    docs: ["Offer of place from NZ institution", "Valid passport", "Financial evidence (NZD 15,000–$20,000 per year)", "Health and character declarations", "Travel insurance (recommended)", "Academic transcripts"],
    tips: ["You can work 20 hours/week during semester and full-time during holidays", "Post-study work visa up to 3 years depending on qualification level", "No mandatory health insurance but it is strongly recommended"],
  },
  ireland: {
    title: "Ireland Student Visa from Nepal",
    intro: "Nepali students need a Study Visa (D Study Visa) to study in Ireland for courses longer than 90 days. Applications are submitted through the AVATS (Application for a Visa or Travel Service) online system.",
    steps: [
      { title: "Receive Acceptance Letter", text: "Obtain a formal acceptance letter from an Irish institution listed on the Interim List of Eligible Programmes (ILEP)." },
      { title: "Apply Online via AVATS", text: "Apply at visas.inis.gov.ie. Complete the form, pay the visa fee (€60 for single entry, €100 for multi-entry), and upload documents." },
      { title: "Submit Documents to Irish Embassy", text: "Send physical documents to the Irish Embassy New Delhi (handles Nepal applications). Include: acceptance letter, financial evidence, passport copy, photos." },
      { title: "Decision", text: "Processing: 4–8 weeks from submission. If approved, a visa sticker is placed in your passport." },
    ],
    docs: ["Acceptance letter from ILEP institution", "Valid passport", "Bank statements (€7,000–€10,000 recommended)", "IELTS score (6.0+ typical)", "Academic transcripts"],
    tips: ["You can work 20 hours/week during term, 40 hours during summer", "After graduation, 24-month Third Level Graduate Programme visa available", "Irish education is taught in English — no language course required"],
  },
};

const SCHOLARSHIPS_CONTENT: Record<string, { title: string; intro: string; scholarships: { name: string; amount: string; level: string; deadline: string; eligibility: string; notes: string }[] }> = {
  canada: {
    title: "Scholarships in Canada for Nepali Students",
    intro: "Canada offers significant scholarship opportunities through government programs, universities, and private organizations. Many scholarships are awarded automatically with admission for high-achieving students.",
    scholarships: [
      { name: "Vanier Canada Graduate Scholarships", amount: "CA$50,000/year for 3 years", level: "PhD", deadline: "November (annual)", eligibility: "Nominated by Canadian university — academic excellence, research potential, leadership", notes: "One of the most prestigious in Canada. You cannot apply directly." },
      { name: "Ontario Graduate Scholarship (OGS)", amount: "CA$10,000/year", level: "Master's / PhD", deadline: "January–March (varies by university)", eligibility: "A-minus average or higher in last 2 years of full-time study", notes: "Available at Ontario universities only. Highly competitive." },
      { name: "University Merit Scholarships", amount: "CA$3,000–$25,000/year", level: "Bachelor's / Master's", deadline: "With admission application", eligibility: "Automatic with admission based on GPA and test scores", notes: "Most Canadian universities offer automatic merit awards. Ask your counsellor." },
      { name: "SDS Scholarship (Institutional)", amount: "Varies", level: "Diploma / Bachelor's", deadline: "Varies", eligibility: "High IELTS scores (7.0+) + strong academic record", notes: "Many colleges offer additional incentives for SDS-stream applicants." },
    ],
  },
  australia: {
    title: "Scholarships in Australia for Nepali Students",
    intro: "Australia offers both government and university scholarships for international students. The Australia Awards Scholarship is the flagship program for students from Nepal and other developing nations.",
    scholarships: [
      { name: "Australia Awards Scholarship", amount: "Full scholarship — tuition + living allowance + airfare", level: "Master's / PhD", deadline: "April–June each year for January intake", eligibility: "Nepali citizens, employed, returning to Nepal after graduation", notes: "Highly competitive. IELTS 6.5+ required. Strong leadership and professional experience preferred." },
      { name: "Destination Australia", amount: "AUD $15,000/year", level: "All levels", deadline: "Varies by institution", eligibility: "International students studying in regional Australia", notes: "Designed to encourage study in regional areas — less competition than city campuses." },
      { name: "University Merit Scholarships", amount: "AUD $5,000–$30,000/year", level: "Bachelor's / Master's", deadline: "Automatic with application", eligibility: "Academic excellence — typically 85%+ or equivalent", notes: "Curtin, Monash, La Trobe, RMIT, and Deakin all have strong international scholarship programs." },
      { name: "Endeavour Research Fellowship", amount: "AUD $4,000–$7,500 (short-term)", level: "Research / PhD", deadline: "June each year", eligibility: "PhD candidates conducting research in Australia", notes: "Short-term research grant. Check current availability as program details change." },
    ],
  },
  uk: {
    title: "Scholarships in the UK for Nepali Students",
    intro: "The UK has one of the world's most prestigious scholarship ecosystems. The Chevening Scholarship is the flagship program for future leaders from Nepal.",
    scholarships: [
      { name: "Chevening Scholarship", amount: "Full scholarship — tuition + living + airfare", level: "Master's (1 year)", deadline: "November each year", eligibility: "Nepali citizens with 2+ years work experience, strong leadership potential, returning to Nepal after", notes: "Most prestigious UK government scholarship. 1,500+ awarded globally. Highly competitive from Nepal." },
      { name: "Commonwealth Scholarship", amount: "Full scholarship — tuition + living + airfare", level: "Master's / PhD", deadline: "December–February (varies)", eligibility: "Nepali citizens, high academic merit, development focus", notes: "Funded by UK government for Commonwealth nations including Nepal. For study related to development." },
      { name: "GREAT Scholarship for Nepal", amount: "£10,000 minimum toward tuition", level: "Master's", deadline: "Varies by university", eligibility: "Nepali citizens applying to participating UK universities", notes: "Supported by the British Council. Universities include U of Edinburgh, Sussex, Manchester, and others." },
      { name: "University Merit Scholarships", amount: "£3,000–£10,000/year", level: "Bachelor's / Master's", deadline: "Automatic with application", eligibility: "Academic excellence — typically 80%+ or equivalent", notes: "Most Russell Group and post-92 universities offer international scholarships. Apply early." },
    ],
  },
  germany: {
    title: "Scholarships in Germany for Nepali Students (DAAD and More)",
    intro: "Germany offers world-class scholarships through DAAD — the German Academic Exchange Service. Most German public universities already charge zero tuition, making Germany one of the most affordable study destinations globally.",
    scholarships: [
      { name: "DAAD Development-Related Postgraduate Courses", amount: "Full scholarship — monthly stipend €934, health insurance, travel allowance", level: "Master's", deadline: "October–December each year", eligibility: "Mid-career professionals from developing countries, working in development-related fields, returning home", notes: "Top choice for Nepali students in environment, agriculture, public health, engineering, and economics." },
      { name: "Helmut-Schmidt Programme (Public Policy)", amount: "Full scholarship — monthly stipend + allowances", level: "Master's", deadline: "October each year", eligibility: "Future leaders in public policy, civil society, public administration from developing countries", notes: "For students planning careers in government, NGOs, or international organizations." },
      { name: "DAAD Research Grants (Doctoral)", amount: "€1,200/month + travel allowance", level: "PhD", deadline: "October–November each year", eligibility: "Master's graduates with excellent academic record, research proposal required", notes: "For full PhD at a German university. Duration: up to 4 years." },
      { name: "Deutschlandstipendium", amount: "€300/month", level: "Bachelor's / Master's", deadline: "Varies by university", eligibility: "Students enrolled at a German university — based on academic performance and social engagement", notes: "Funded 50% by federal government, 50% by private donors. Apply after enrolling in Germany." },
    ],
  },
  usa: {
    title: "Scholarships in the USA for Nepali Students",
    intro: "The USA offers the world's largest volume of scholarship funding. However, most funding is institution-specific — the key is identifying the right universities with strong international aid programs.",
    scholarships: [
      { name: "Fulbright Foreign Student Program", amount: "Full scholarship — tuition + living + airfare", level: "Master's / PhD", deadline: "March each year (Nepal deadline)", eligibility: "Nepali citizens with Bachelor's, strong English, leadership potential, returning to Nepal", notes: "The most prestigious US government scholarship. Highly competitive — typically 5–15 awards per year from Nepal." },
      { name: "Aga Khan Foundation International Scholarship", amount: "50% grant + 50% loan", level: "Master's", deadline: "March 31 each year", eligibility: "Students from developing countries, financial need, academic merit", notes: "Available for Master's in any field. Prioritizes development-related work." },
      { name: "University Merit Aid & Financial Aid", amount: "$5,000–$50,000+ per year", level: "Bachelor's / Master's", deadline: "Varies by university (November–March)", eligibility: "Varies — academic achievement, leadership, or financial need", notes: "Liberal arts colleges (Amherst, Williams, Oberlin, Grinnell) often offer the most generous aid to international students." },
      { name: "Graduate Assistantships (TA/RA)", amount: "Tuition waiver + $15,000–$25,000/year stipend", level: "Master's / PhD", deadline: "With graduate application", eligibility: "Academic excellence — CGPA 3.5+, strong GRE", notes: "Most competitive US PhD programs fully fund students through TA/RA positions. Apply broadly." },
    ],
  },
  "new-zealand": {
    title: "Scholarships in New Zealand for Nepali Students",
    intro: "New Zealand Government Scholarships and university-specific awards provide significant funding opportunities for Nepali students.",
    scholarships: [
      { name: "New Zealand Aid Programme Scholarship", amount: "Full scholarship — tuition + living + airfare", level: "Bachelor's / Master's / PhD", deadline: "March–April each year", eligibility: "Nepali citizens, development-focused study, returning to Nepal", notes: "Managed by New Zealand Ministry of Foreign Affairs. Highly competitive." },
      { name: "University of Auckland International Student Scholarship", amount: "NZD $10,000–$15,000/year", level: "Master's", deadline: "With admission application", eligibility: "Academic excellence — equivalent to NZ A-grade average", notes: "Automatically considered with admission application." },
      { name: "Victoria University Wellington International Excellence Award", amount: "NZD $10,000 one-time", level: "All levels", deadline: "Rolling", eligibility: "Strong academic record from international students", notes: "Apply through the university admissions office." },
    ],
  },
  ireland: {
    title: "Scholarships in Ireland for Nepali Students",
    intro: "Ireland offers government and university scholarships for international students, with the Government of Ireland International Education Scholarship being the flagship award.",
    scholarships: [
      { name: "Government of Ireland International Education Scholarship", amount: "€10,000 one-time award", level: "Bachelor's / Master's / PhD", deadline: "Varies each year", eligibility: "Non-EEA students, academic excellence", notes: "Highly competitive. Covers partial tuition. Apply through Irish universities." },
      { name: "University College Dublin International Excellence Scholarship", amount: "€3,000–€10,000/year", level: "All levels", deadline: "With admission application", eligibility: "Academic merit — 80%+ equivalent", notes: "Automatically considered with application." },
    ],
  },
};

const COST_CONTENT: Record<string, { title: string; currency: string; symbol: string; nprRate: number; cities: { name: string; items: [string, string][] }[]; totalNote: string; tips: string[] }> = {
  canada: {
    title: "Cost of Studying in Canada for Nepali Students",
    currency: "CAD", symbol: "CA$", nprRate: 96,
    cities: [
      { name: "Toronto (Ontario)", items: [["Tuition (University)", "CA$20,000–$35,000/yr"], ["Tuition (College)", "CA$8,000–$16,000/yr"], ["Rent (shared)", "CA$800–$1,400/mo"], ["Food & groceries", "CA$300–$500/mo"], ["Transport (TTC pass)", "CA$156/mo"], ["Health insurance (UHIP)", "CA$756/yr"], ["Total per year (estimate)", "CA$25,000–$45,000"]] },
      { name: "Vancouver (BC)", items: [["Tuition (University)", "CA$22,000–$38,000/yr"], ["Tuition (College)", "CA$10,000–$18,000/yr"], ["Rent (shared)", "CA$900–$1,600/mo"], ["Food & groceries", "CA$300–$500/mo"], ["Transport (TransLink)", "CA$120/mo"], ["Total per year (estimate)", "CA$28,000–$50,000"]] },
      { name: "Winnipeg (Manitoba)", items: [["Tuition (University)", "CA$15,000–$22,000/yr"], ["Tuition (College)", "CA$6,000–$12,000/yr"], ["Rent (shared)", "CA$500–$800/mo"], ["Food & groceries", "CA$250–$400/mo"], ["Transport", "CA$100/mo"], ["Total per year (estimate)", "CA$18,000–$32,000"]] },
    ],
    totalNote: "Most affordable: Manitoba, Saskatchewan. Most expensive: Toronto, Vancouver.",
    tips: ["Work 24 hours/week off-campus (increased from 20 hrs in 2024)", "On-campus work is unlimited", "Minimum wage: CA$17–$17.40/hr depending on province"],
  },
  australia: {
    title: "Cost of Studying in Australia for Nepali Students",
    currency: "AUD", symbol: "A$", nprRate: 88,
    cities: [
      { name: "Melbourne (Victoria)", items: [["Tuition (University UG)", "A$28,000–$45,000/yr"], ["Tuition (TAFE/VET)", "A$5,000–$22,000/yr"], ["Rent (shared)", "A$700–$1,200/mo"], ["Food", "A$300–$500/mo"], ["Transport (Myki pass)", "A$80–$120/mo"], ["OSHC (mandatory)", "A$700/yr"], ["Total per year (estimate)", "A$32,000–$55,000"]] },
      { name: "Sydney (NSW)", items: [["Tuition (University UG)", "A$28,000–$45,000/yr"], ["Rent (shared)", "A$800–$1,400/mo"], ["Food", "A$300–$500/mo"], ["Transport (Opal card)", "A$80–$150/mo"], ["Total per year (estimate)", "A$35,000–$58,000"]] },
      { name: "Brisbane (QLD)", items: [["Tuition (University UG)", "A$24,000–$38,000/yr"], ["Rent (shared)", "A$600–$1,000/mo"], ["Food", "A$280–$450/mo"], ["Transport", "A$100/mo"], ["Total per year (estimate)", "A$28,000–$48,000"]] },
    ],
    totalNote: "Most affordable major city: Brisbane, Adelaide, Perth. Most expensive: Sydney.",
    tips: ["OSHC (Overseas Student Health Cover) is mandatory — budget A$700–$900/year", "Students can work 48 hours/fortnight during semester and unlimited during breaks", "Minimum wage: A$24.10/hr"],
  },
  uk: {
    title: "Cost of Studying in the UK for Nepali Students",
    currency: "GBP", symbol: "£", nprRate: 170,
    cities: [
      { name: "London", items: [["Tuition (University UG)", "£14,000–£26,000/yr"], ["Tuition (Master's)", "£16,000–£32,000/yr"], ["Rent (shared)", "£900–£1,500/mo"], ["Food", "£250–£400/mo"], ["Transport (Travelcard)", "£180/mo"], ["IHS (mandatory)", "£776/yr"], ["Total per year (estimate)", "£28,000–£48,000"]] },
      { name: "Manchester / Leeds", items: [["Tuition (University UG)", "£14,000–£22,000/yr"], ["Rent (shared)", "£500–£900/mo"], ["Food", "£200–£350/mo"], ["Transport", "£60–£100/mo"], ["IHS (mandatory)", "£776/yr"], ["Total per year (estimate)", "£20,000–£35,000"]] },
      { name: "Scotland (Edinburgh/Glasgow)", items: [["Tuition (University UG)", "£14,000–£22,000/yr"], ["Rent (shared)", "£500–£900/mo"], ["Total per year (estimate)", "£20,000–$33,000"]] },
    ],
    totalNote: "London costs 40–50% more than outside London. Consider Manchester, Leeds, Glasgow for better value.",
    tips: ["IHS (Immigration Health Surcharge) is paid upfront for the entire visa: £776/year", "Students can work 20 hours/week during term", "Graduate Route Visa: work unrestricted for 2 years after undergrad, 3 years after postgrad"],
  },
  germany: {
    title: "Cost of Studying in Germany for Nepali Students",
    currency: "EUR", symbol: "€", nprRate: 148,
    cities: [
      { name: "Munich (Bavaria)", items: [["Tuition (public university)", "€0 (only semester fee €156–€350)"], ["Rent (shared)", "€700–€1,200/mo"], ["Food", "€200–$300/mo"], ["Transport (semester ticket)", "€29/mo (included in semester fee in some states)"], ["Health insurance (TK/AOK)", "€110/mo"], ["Total per year (estimate)", "€12,000–€18,000"]] },
      { name: "Berlin", items: [["Tuition (public university)", "€0 (semester fee €317)"], ["Rent (shared)", "€600–€1,000/mo"], ["Food", "€200–€300/mo"], ["Health insurance", "€110/mo"], ["Total per year (estimate)", "€10,000–€16,000"]] },
      { name: "Hamburg / Cologne / Frankfurt", items: [["Tuition (public university)", "€0 (semester fee €100–€350)"], ["Rent (shared)", "€500–€900/mo"], ["Food", "€200–€300/mo"], ["Total per year (estimate)", "€9,000–€15,000"]] },
    ],
    totalNote: "Cheapest major study destination in Europe. €11,208 blocked account required for visa.",
    tips: ["Blocked account (Sperrkonto): €11,208 deposited before visa — released €934/month", "Students can work 120 full days or 240 half days per year", "18-month job seeker visa after graduation"],
  },
  usa: {
    title: "Cost of Studying in the USA for Nepali Students",
    currency: "USD", symbol: "$", nprRate: 135,
    cities: [
      { name: "State University (Average)", items: [["Tuition (State University UG)", "$15,000–$30,000/yr"], ["Tuition (Private University UG)", "$35,000–$60,000/yr"], ["Tuition (Community College)", "$8,000–$15,000/yr"], ["Rent (shared)", "$600–$1,200/mo"], ["Food", "$300–$500/mo"], ["Health insurance", "$2,000–$3,000/yr"], ["Total per year (state univ.)", "$25,000–$45,000"]] },
      { name: "Ivy League / Top Private", items: [["Tuition", "$55,000–$65,000/yr"], ["Room & Board (on-campus)", "$20,000–$25,000/yr"], ["Total per year", "$75,000–$90,000"]] },
    ],
    totalNote: "Community college → transfer to university is 50–60% cheaper than starting at a 4-year institution.",
    tips: ["OPT: 12 months work after graduation (STEM fields: 36 months)", "Graduate Assistantships often include full tuition waiver + stipend for Master's/PhD", "SEVIS fee $350 + visa fee $185 are one-time expenses"],
  },
  "new-zealand": {
    title: "Cost of Studying in New Zealand for Nepali Students",
    currency: "NZD", symbol: "NZ$", nprRate: 81,
    cities: [
      { name: "Auckland", items: [["Tuition (University UG)", "NZD $25,000–$38,000/yr"], ["Rent (shared)", "NZD $800–$1,400/mo"], ["Food", "NZD $300–$500/mo"], ["Transport", "NZD $150/mo"], ["Total per year (estimate)", "NZD $35,000–$55,000"]] },
      { name: "Wellington / Dunedin", items: [["Tuition (University UG)", "NZD $22,000–$34,000/yr"], ["Rent (shared)", "NZD $600–$1,000/mo"], ["Total per year (estimate)", "NZD $28,000–$45,000"]] },
    ],
    totalNote: "New Zealand is slightly more affordable than Australia. Dunedin (Otago) is the most student-friendly city.",
    tips: ["Work rights: 20 hours/week during term, unlimited during breaks", "Post-study work visa up to 3 years based on qualification level and location"],
  },
  ireland: {
    title: "Cost of Studying in Ireland for Nepali Students",
    currency: "EUR", symbol: "€", nprRate: 148,
    cities: [
      { name: "Dublin", items: [["Tuition (University UG)", "€10,000–$22,000/yr"], ["Rent (shared)", "€700–€1,200/mo"], ["Food", "€250–€400/mo"], ["Transport", "€100–€150/mo"], ["Total per year (estimate)", "€20,000–€35,000"]] },
    ],
    totalNote: "Dublin is one of the most expensive cities in Europe. Cork and Galway offer better value.",
    tips: ["Work rights: 20 hours/week during term, 40 hours during summer", "24-month graduate visa after graduation for degree holders"],
  },
};

const UNIVERSITIES_CONTENT: Record<string, { title: string; intro: string; universities: { name: string; city: string; rank: string; programs: string; tuition: string }[] }> = {
  canada: {
    title: "Top Universities in Canada for Nepali Students",
    intro: "Canada has 96+ universities ranked internationally. These are the most popular among Nepali students based on program availability, acceptance rates, and post-graduation outcomes.",
    universities: [
      { name: "University of Toronto", city: "Toronto, ON", rank: "QS #25", programs: "Engineering, Business, Life Sciences, Computer Science", tuition: "CA$45,000–$60,000/yr" },
      { name: "University of British Columbia (UBC)", city: "Vancouver, BC", rank: "QS #38", programs: "Forestry, Engineering, Business, Medicine", tuition: "CA$36,000–$55,000/yr" },
      { name: "McGill University", city: "Montreal, QC", rank: "QS #44", programs: "Law, Medicine, Business, Engineering", tuition: "CA$20,000–$35,000/yr" },
      { name: "Fanshawe College", city: "London, ON", rank: "Top Ontario College", programs: "Business, Hospitality, IT, Trades", tuition: "CA$12,000–$16,000/yr" },
      { name: "George Brown College", city: "Toronto, ON", rank: "Top Ontario College", programs: "Culinary, Business, Health Sciences, IT", tuition: "CA$13,000–$16,000/yr" },
      { name: "Conestoga College", city: "Kitchener-Waterloo, ON", rank: "Polytechnic", programs: "Engineering Technology, Business, IT", tuition: "CA$11,000–$15,000/yr" },
      { name: "University of Manitoba", city: "Winnipeg, MB", rank: "Top 200 Canada", programs: "Engineering, Science, Business, Agriculture", tuition: "CA$15,000–$22,000/yr" },
      { name: "Simon Fraser University (SFU)", city: "Burnaby, BC", rank: "Top 300 World", programs: "Business, Computing Science, Engineering", tuition: "CA$25,000–$35,000/yr" },
    ],
  },
  australia: {
    title: "Top Universities in Australia for Nepali Students",
    intro: "Australia's top universities (Group of Eight) are world-ranked and highly sought after. These are the most popular institutions among Nepali students.",
    universities: [
      { name: "University of Melbourne", city: "Melbourne, VIC", rank: "QS #33", programs: "Law, Medicine, Engineering, Business", tuition: "A$38,000–$55,000/yr" },
      { name: "University of Sydney", city: "Sydney, NSW", rank: "QS #40", programs: "Business, Law, Medicine, Architecture", tuition: "A$36,000–$52,000/yr" },
      { name: "University of Queensland (UQ)", city: "Brisbane, QLD", rank: "QS #47", programs: "Engineering, Science, Business, Health", tuition: "A$32,000–$48,000/yr" },
      { name: "Curtin University", city: "Perth, WA", rank: "QS Top 200", programs: "Engineering, Mining, Commerce, IT", tuition: "A$28,000–$42,000/yr" },
      { name: "RMIT University", city: "Melbourne, VIC", rank: "QS Top 250", programs: "Design, Business, Engineering, IT", tuition: "A$28,000–$40,000/yr" },
      { name: "La Trobe University", city: "Melbourne, VIC", rank: "QS Top 400", programs: "Nursing, Business, Health Sciences, Law", tuition: "A$24,000–$36,000/yr" },
      { name: "Deakin University", city: "Melbourne/Geelong", rank: "QS Top 300", programs: "Business, Nursing, IT, Education", tuition: "A$24,000–$36,000/yr" },
      { name: "Monash University", city: "Melbourne, VIC", rank: "QS #57", programs: "Pharmacy, Engineering, Law, Business", tuition: "A$32,000–$48,000/yr" },
    ],
  },
  uk: {
    title: "Top Universities in the UK for Nepali Students",
    intro: "The UK has some of the world's oldest and most prestigious universities. These are the most popular institutions among Nepali students.",
    universities: [
      { name: "University of Oxford", city: "Oxford, England", rank: "QS #3", programs: "PPE, Medicine, Law, Engineering", tuition: "£28,000–£45,000/yr" },
      { name: "University of Cambridge", city: "Cambridge, England", rank: "QS #5", programs: "Natural Sciences, Engineering, Law, Medicine", tuition: "£28,000–£45,000/yr" },
      { name: "University College London (UCL)", city: "London, England", rank: "QS #9", programs: "Architecture, Medicine, Engineering, Arts", tuition: "£22,000–£35,000/yr" },
      { name: "University of Edinburgh", city: "Edinburgh, Scotland", rank: "QS #27", programs: "Medicine, Law, Business, Divinity", tuition: "£18,000–£28,000/yr" },
      { name: "University of Manchester", city: "Manchester, England", rank: "QS #32", programs: "Engineering, Business, Life Sciences", tuition: "£18,000–£26,000/yr" },
      { name: "University of Hertfordshire", city: "Hatfield, England", rank: "Post-92", programs: "Business, Nursing, Computer Science, Aviation", tuition: "£14,500–£18,000/yr" },
      { name: "Coventry University", city: "Coventry, England", rank: "Post-92", programs: "Business, Engineering, Computing, Automotive", tuition: "£13,000–£17,000/yr" },
      { name: "University of the West of England (UWE)", city: "Bristol, England", rank: "Post-92", programs: "Law, Business, Health, Film", tuition: "£13,500–£17,000/yr" },
    ],
  },
  germany: {
    title: "Top Universities in Germany for Nepali Students",
    intro: "German public universities offer world-class education at zero tuition. These are the top institutions and most popular choices among international students.",
    universities: [
      { name: "Technical University of Munich (TUM)", city: "Munich, Bavaria", rank: "QS Top 40", programs: "Engineering, Computer Science, Natural Sciences, Management", tuition: "€0 (semester fee ~€150)" },
      { name: "Ludwig Maximilian University (LMU)", city: "Munich, Bavaria", rank: "QS Top 60", programs: "Medicine, Law, Social Sciences, Humanities", tuition: "€0 (semester fee ~€150)" },
      { name: "Heidelberg University", city: "Heidelberg, BW", rank: "QS Top 80", programs: "Medicine, Life Sciences, Law, Social Sciences", tuition: "€0 (semester fee ~€175)" },
      { name: "Humboldt University Berlin", city: "Berlin", rank: "QS Top 120", programs: "Humanities, Law, Medicine, Natural Sciences", tuition: "€0 (semester fee ~€317)" },
      { name: "Free University of Berlin (FU Berlin)", city: "Berlin", rank: "QS Top 150", programs: "Social Sciences, Political Science, Life Sciences", tuition: "€0 (semester fee ~€317)" },
      { name: "RWTH Aachen University", city: "Aachen, NRW", rank: "QS Top 150", programs: "Engineering, Computer Science, Business Engineering", tuition: "€0 (semester fee ~€300)" },
      { name: "Karlsruhe Institute of Technology (KIT)", city: "Karlsruhe, BW", rank: "QS Top 200", programs: "Engineering, Physics, Computer Science", tuition: "€0 (semester fee ~€170)" },
      { name: "University of Hamburg", city: "Hamburg", rank: "QS Top 200", programs: "Business, Law, Natural Sciences, Social Sciences", tuition: "€0 (semester fee ~€350)" },
    ],
  },
  usa: {
    title: "Top Universities in the USA for Nepali Students",
    intro: "The USA has the world's highest concentration of ranked universities. These are the most popular institutions among Nepali students — from community college pathways to Ivy League.",
    universities: [
      { name: "MIT", city: "Cambridge, MA", rank: "QS #1", programs: "Engineering, Computer Science, Physics, Architecture", tuition: "$59,750/yr" },
      { name: "Stanford University", city: "Stanford, CA", rank: "QS #5", programs: "Engineering, Business (MBA), Medicine, Law", tuition: "$62,484/yr" },
      { name: "University of Texas at Dallas (UTD)", city: "Richardson, TX", rank: "Top 800 World", programs: "Computer Science, Engineering, Business, Arts & Sciences", tuition: "$30,000–$40,000/yr" },
      { name: "Arizona State University (ASU)", city: "Tempe, AZ", rank: "Top 300 US", programs: "Engineering, Business, Education, Social Work", tuition: "$31,000–$38,000/yr" },
      { name: "George Mason University", city: "Fairfax, VA", rank: "Top 400 US", programs: "IT, Policy, Business, Engineering", tuition: "$37,000–$42,000/yr" },
      { name: "Community Colleges (Transfer Pathway)", city: "Various", rank: "Transfer to Top Universities", programs: "All subjects — transfer to UC system, UW, UT after 2 years", tuition: "$8,000–$15,000/yr" },
      { name: "Purdue University", city: "West Lafayette, IN", rank: "QS Top 150", programs: "Engineering, Technology, Agriculture, Pharmacy", tuition: "$28,000–$32,000/yr" },
      { name: "Ohio State University", city: "Columbus, OH", rank: "QS Top 200", programs: "Business, Engineering, Medicine, Education", tuition: "$33,000–$40,000/yr" },
    ],
  },
  "new-zealand": {
    title: "Top Universities in New Zealand for Nepali Students",
    intro: "New Zealand has 8 state-funded universities, all of high quality. These are the most popular choices for Nepali students.",
    universities: [
      { name: "University of Auckland", city: "Auckland", rank: "QS Top 70", programs: "Engineering, Medicine, Law, Commerce", tuition: "NZD $30,000–$45,000/yr" },
      { name: "University of Otago", city: "Dunedin", rank: "QS Top 200", programs: "Medicine, Dentistry, Health Sciences, Business", tuition: "NZD $26,000–$38,000/yr" },
      { name: "Victoria University of Wellington", city: "Wellington", rank: "QS Top 250", programs: "Law, Policy, Architecture, Business", tuition: "NZD $26,000–$36,000/yr" },
      { name: "Massey University", city: "Palmerston North / Auckland", rank: "QS Top 400", programs: "Agriculture, Veterinary, Business, Design", tuition: "NZD $22,000–$32,000/yr" },
    ],
  },
  ireland: {
    title: "Top Universities in Ireland for Nepali Students",
    intro: "Ireland has several world-ranked universities offering quality education in English. These are the most popular among Nepali students.",
    universities: [
      { name: "University College Dublin (UCD)", city: "Dublin", rank: "QS Top 200", programs: "Business, Engineering, Medicine, Law", tuition: "€15,000–$25,000/yr" },
      { name: "Trinity College Dublin (TCD)", city: "Dublin", rank: "QS Top 100", programs: "Business, Engineering, Medicine, Arts", tuition: "€17,000–$27,000/yr" },
      { name: "University College Cork (UCC)", city: "Cork", rank: "QS Top 400", programs: "Food Science, Medicine, Law, Business", tuition: "€12,000–$20,000/yr" },
      { name: "National University of Ireland Galway", city: "Galway", rank: "QS Top 300", programs: "Engineering, Medicine, Arts, Business", tuition: "€12,000–$20,000/yr" },
    ],
  },
};

// ─── Page Component ────────────────────────────────────────────────────────────

const VALID_SUBPAGES = ["visa", "scholarships", "cost", "universities"] as const;
type SubPage = (typeof VALID_SUBPAGES)[number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subpage: string }>;
}): Promise<Metadata> {
  const { slug: country, subpage } = await params;

  if (!VALID_SUBPAGES.includes(subpage as SubPage)) return {};

  const supabase = await createClient();
  const { data } = await supabase.from("countries").select("name, meta_title").eq("code", country).single();
  const countryName = data?.name || country.charAt(0).toUpperCase() + country.slice(1);

  const titles: Record<SubPage, string> = {
    visa: `${countryName} Student Visa from Nepal | Step-by-Step Guide — Transit Education`,
    scholarships: `Scholarships in ${countryName} for Nepali Students | Complete Guide — Transit Education`,
    cost: `Cost of Studying in ${countryName} | Tuition & Living Costs — Transit Education`,
    universities: `Top Universities in ${countryName} for Nepali Students — Transit Education`,
  };

  const descriptions: Record<SubPage, string> = {
    visa: `Complete guide to ${countryName} student visa from Nepal. Document checklist, step-by-step process, processing times, and tips to avoid rejection.`,
    scholarships: `Best scholarships for Nepali students in ${countryName}. Government scholarships, university merit awards, and application tips.`,
    cost: `Detailed breakdown of cost of studying in ${countryName} — tuition fees, living costs by city, health insurance, and visa fees for Nepali students.`,
    universities: `Top universities in ${countryName} popular among Nepali students. Rankings, tuition fees, and popular programs.`,
  };

  return {
    title: titles[subpage as SubPage],
    description: descriptions[subpage as SubPage],
    alternates: { canonical: `https://transiteducation.com.np/study-abroad/${country}/${subpage}` },
    openGraph: {
      title: titles[subpage as SubPage],
      description: descriptions[subpage as SubPage],
      url: `https://transiteducation.com.np/study-abroad/${country}/${subpage}`,
      type: "website",
    },
  };
}

export default async function CountrySubPage({
  params,
}: {
  params: Promise<{ slug: string; subpage: string }>;
}) {
  const { slug: country, subpage } = await params;

  if (!VALID_SUBPAGES.includes(subpage as SubPage)) notFound();

  const supabase = await createClient();
  const { data: countryData } = await supabase
    .from("countries")
    .select("name, code, cost_of_living, scholarship_data, university_list, visa_extended")
    .eq("code", country)
    .single();

  const { data: faqsRaw } = await supabase
    .from("faqs")
    .select("*")
    .eq("page_path", `study-abroad/${country}/${subpage}`)
    .eq("status", "published")
    .order("display_order", { ascending: true });

  const faqs = faqsRaw?.map((f) => ({ ...f, featured: f.is_featured, status: "Published" })) || [];

  const countryName = countryData?.name || country.charAt(0).toUpperCase() + country.slice(1);

  const subpageLabels: Record<SubPage, string> = {
    visa: "Student Visa Guide",
    scholarships: "Scholarships",
    cost: "Cost of Studying",
    universities: "Top Universities",
  };

  const siblingLinks = VALID_SUBPAGES.filter((s) => s !== subpage).map((s) => ({
    label: subpageLabels[s],
    href: `/study-abroad/${country}/${s}`,
  }));

  return (
    <main className="pt-20">
      {/* Breadcrumb Hero */}
      <section className="bg-black py-20 text-white">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/study-abroad" className="hover:text-white transition-colors">Study Abroad</Link>
            <span>/</span>
            <Link href={`/study-abroad/${country}`} className="hover:text-white transition-colors capitalize">{countryName}</Link>
            <span>/</span>
            <span className="text-white capitalize">{subpageLabels[subpage as SubPage]}</span>
          </div>

          <SectionLabel className="text-white border-white/20 bg-white/10">{countryName}</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4">
            {subpage === "visa" && `${countryName} Student Visa from Nepal`}
            {subpage === "scholarships" && `Scholarships in ${countryName} for Nepali Students`}
            {subpage === "cost" && `Cost of Studying in ${countryName}`}
            {subpage === "universities" && `Top Universities in ${countryName}`}
          </h1>

          {/* Sub-page nav */}
          <div className="flex gap-3 mt-8 flex-wrap">
            {VALID_SUBPAGES.map((s) => (
              <Link
                key={s}
                href={`/study-abroad/${country}/${s}`}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                  s === subpage
                    ? "bg-brand text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                {subpageLabels[s]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {subpage === "visa" && <VisaContent country={country} countryName={countryName} />}
              {subpage === "scholarships" && <ScholarshipsContent country={country} countryName={countryName} />}
              {subpage === "cost" && <CostContent country={country} countryName={countryName} />}
              {subpage === "universities" && <UniversitiesContent country={country} countryName={countryName} />}
            </div>

            <aside className="space-y-8">
              {/* CTA Card */}
              <div className="bg-brand rounded-[2rem] p-8 text-white sticky top-28">
                <h3 className="text-xl font-bold mb-4">Get Expert Guidance</h3>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  Our certified counsellors guide you through every step — from profile evaluation to visa approval.
                </p>
                <Link href="/contact" className="block text-center bg-white text-brand px-6 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-all text-sm mb-3">
                  Book Free Consultation
                </Link>
                <a href="https://wa.me/9779851315991" target="_blank" rel="noopener noreferrer" className="block text-center bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity text-sm">
                  WhatsApp Us
                </a>
              </div>

              {/* Related links */}
              <div className="bg-off-white border border-gray-100 rounded-[2rem] p-6">
                <h4 className="font-bold text-black mb-4">{countryName} Guides</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href={`/study-abroad/${country}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors">
                      <ArrowLeft className="w-3 h-3" /> Back to {countryName} Overview
                    </Link>
                  </li>
                  {siblingLinks.map((link, i) => (
                    <li key={i}>
                      <Link href={link.href} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors">
                        <CheckCircle2 className="w-3 h-3 text-brand" /> {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/tools/cost-calculator" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors">
                      <ExternalLink className="w-3 h-3 text-brand" /> Cost Calculator Tool
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-16 bg-off-white">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <SectionLabel>Questions?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4">Frequently Asked Questions</h2>
            </div>
            <FAQAccordion items={faqs} />
          </div>
        </section>
      )}
    </main>
  );
}

// ─── Sub-Page Content Components ──────────────────────────────────────────────

function VisaContent({ country, countryName }: { country: string; countryName: string }) {
  const content = VISA_CONTENT[country] || VISA_CONTENT["canada"];
  if (!content) return <p className="text-gray-500">Visa guide coming soon. Contact us for personalised guidance.</p>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">{content.title}</h2>
        <p className="text-gray-600 leading-relaxed">{content.intro}</p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-black mb-6">Step-by-Step Process</h3>
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {content.steps.map((step, i) => (
            <div key={i} className="relative flex gap-6">
              <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0 font-black text-sm z-10">
                {i + 1}
              </div>
              <div className="bg-off-white border border-gray-100 rounded-2xl p-6 flex-1">
                <h4 className="font-bold text-black mb-2">{step.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-off-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-black mb-4">Required Documents</h3>
          <ul className="space-y-2">
            {content.docs.map((doc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0" /> {doc}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-brand/5 border border-brand/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-black mb-4">Expert Tips</h3>
          <ul className="space-y-3">
            {content.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-brand font-black shrink-0 mt-0.5">✓</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScholarshipsContent({ country, countryName }: { country: string; countryName: string }) {
  const content = SCHOLARSHIPS_CONTENT[country];
  if (!content) return <p className="text-gray-500">Scholarship guide coming soon.</p>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">{content.title}</h2>
        <p className="text-gray-600 leading-relaxed">{content.intro}</p>
      </div>

      <div className="space-y-6">
        {content.scholarships.map((s, i) => (
          <div key={i} className="bg-off-white border border-gray-100 rounded-2xl p-6 hover:border-brand/20 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="font-bold text-black text-lg leading-tight">{s.name}</h3>
              <span className="text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-1 shrink-0">{s.level}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Amount</p>
                <p className="font-bold text-black">{s.amount}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Application Deadline</p>
                <p className="font-semibold text-gray-700">{s.deadline}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed"><strong>Eligibility:</strong> {s.eligibility}</p>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
              <p className="text-xs text-yellow-800">💡 {s.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostContent({ country, countryName }: { country: string; countryName: string }) {
  const content = COST_CONTENT[country];
  if (!content) return <p className="text-gray-500">Cost guide coming soon.</p>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">{content.title}</h2>
        <p className="text-sm text-gray-500">All figures in {content.currency}. Approximate NPR rate: 1 {content.currency} ≈ NPR {content.nprRate}.</p>
      </div>

      {content.cities.map((city, i) => (
        <div key={i} className="bg-off-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-black mb-4">{city.name}</h3>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Item</th>
                  <th className="py-3 px-4 text-right">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {city.items.map(([label, value], j) => (
                  <tr key={j} className={`bg-white hover:bg-off-white ${j === city.items.length - 1 ? "font-bold" : ""}`}>
                    <td className="py-3 px-4 text-gray-700">{label}</td>
                    <td className={`py-3 px-4 text-right ${j === city.items.length - 1 ? "text-brand" : "text-gray-700"}`}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="bg-brand/5 border border-brand/10 rounded-2xl p-6">
        <p className="text-sm font-bold text-brand mb-2">Summary</p>
        <p className="text-gray-700 text-sm">{content.totalNote}</p>
      </div>

      {content.tips.length > 0 && (
        <div className="bg-off-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-black mb-4">Work Rights & Financial Tips</h3>
          <ul className="space-y-2">
            {content.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" /> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center py-6 border-t border-gray-100">
        <p className="text-gray-500 text-sm mb-4">Get a personalised cost estimate based on your specific program and institution.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/tools/cost-calculator" className="bg-brand text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-all">
            Use Cost Calculator
          </Link>
          <Link href="/contact" className="bg-white text-black border border-gray-200 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-all">
            Get Financial Guidance
          </Link>
        </div>
      </div>
    </div>
  );
}

function UniversitiesContent({ country, countryName }: { country: string; countryName: string }) {
  const content = UNIVERSITIES_CONTENT[country];
  if (!content) return <p className="text-gray-500">University guide coming soon.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">{content.title}</h2>
        <p className="text-gray-600 leading-relaxed">{content.intro}</p>
      </div>

      <div className="space-y-4">
        {content.universities.map((uni, i) => (
          <div key={i} className="bg-off-white border border-gray-100 rounded-2xl p-6 hover:border-brand/20 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-bold text-black text-lg">{uni.name}</h3>
                  <span className="text-xs font-bold text-brand bg-brand/10 rounded-full px-2 py-0.5">{uni.rank}</span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{uni.city}</p>
                <p className="text-sm text-gray-600"><strong>Popular programs:</strong> {uni.programs}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400 mb-1">Tuition/year</p>
                <p className="font-bold text-brand text-sm">{uni.tuition}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-off-white border border-gray-100 rounded-2xl p-6 text-center">
        <p className="text-gray-600 text-sm mb-4">Not sure which university is right for your profile? Our counsellors shortlist the best options for you.</p>
        <Link href="/contact" className="bg-brand text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-all">
          Get University Shortlist
        </Link>
      </div>
    </div>
  );
}
