import { Metadata } from "next";
import {
  ShieldCheck,
  Clock,
  FileCheck,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Home,
  CreditCard,
  Phone,
} from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import CountryTabs, { CountryTab } from "@/components/compliance/CountryTabs";
import FAQAccordion from "@/components/shared/FAQAccordion";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Student Compliance Guide",
  description:
    "Country-by-country compliance guidance for Nepali students studying abroad — visa rules, work rights, enrolment requirements, and what to do before and after you arrive.",
  alternates: { canonical: "https://transiteducation.com.np/compliance" },
};

const HERO_FEATURES = [
  { icon: ShieldCheck, label: "Visa-compliant guidance" },
  { icon: Clock,       label: "Updated for 2026" },
  { icon: FileCheck,   label: "Expert-verified" },
];

/* ─── Shared style atoms ─── */
const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-brand" />
      </div>
      <h3 className="text-lg font-bold text-black">{title}</h3>
    </div>
    <div className="pl-12">{children}</div>
  </div>
);

const RuleList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5 text-gray-700 text-sm leading-relaxed">
        <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
        {item}
      </li>
    ))}
  </ul>
);

const WarnBox = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 leading-relaxed">
    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
    <span>{children}</span>
  </div>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 flex gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 leading-relaxed">
    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
    <span>{children}</span>
  </div>
);

/* ─── Australia ─── */
const AustraliaContent = (
  <div>
    <p className="text-gray-600 text-sm leading-relaxed mb-8">
      As a Subclass 500 Student Visa holder, you must meet strict conditions set by the Australian Department of Home Affairs. Breaching these conditions can result in visa cancellation and a ban from re-entering Australia.
    </p>

    <Section title="Enrolment & Attendance" icon={BookOpen}>
      <RuleList items={[
        "Remain enrolled full-time at your registered education provider at all times.",
        "Maintain satisfactory course progress — each provider sets its own benchmarks (typically 50% pass rate per semester).",
        "Attend at least 80% of scheduled contact hours. Providers report attendance to the Department via PRISMS.",
        "Notify your institution immediately if you change your study load, defer, or plan to transfer.",
        "You cannot transfer to another provider within the first 6 months of your principal course unless an exemption applies.",
      ]} />
      <WarnBox>
        Unsatisfactory attendance or academic progress triggers a PRISMS report. The Department may then cancel your visa — even if you are still enrolled.
      </WarnBox>
    </Section>

    <Section title="Work Rights" icon={Briefcase}>
      <RuleList items={[
        "You may work up to 48 hours per fortnight while your course is in session.",
        "There is no work-hour cap during official scheduled course breaks (semester holidays, Christmas break).",
        "Your spouse or de facto partner on a Subclass 500 visa may be entitled to work — check your individual visa grant notice.",
        "Work includes paid employment, volunteer work that replaces a paid position, and contract work.",
        "You cannot work before your course commencement date, even if you have arrived in Australia.",
      ]} />
      <InfoBox>
        The 48-hour per fortnight limit applies to all paid work combined. A fortnight is any 14-day period — not necessarily aligned with a calendar fortnight.
      </InfoBox>
    </Section>

    <Section title="Health Cover (OSHC)" icon={CreditCard}>
      <RuleList items={[
        "Overseas Student Health Cover (OSHC) is mandatory for the full duration of your student visa.",
        "Purchase OSHC before your visa is granted. Most universities arrange it on your behalf — confirm before arrival.",
        "OSHC must cover you, your spouse, and any dependent children on the same visa.",
        "Keep your OSHC membership card and policy number accessible at all times.",
        "If you change providers, ensure your OSHC is transferred or re-purchased to avoid a gap in coverage.",
      ]} />
    </Section>

    <Section title="Address & Reporting Obligations" icon={Home}>
      <RuleList items={[
        "Notify your education provider of your residential address within 7 days of arriving in Australia.",
        "Update your provider and the Department of Home Affairs within 7 days of any address change.",
        "Keep your contact details (phone and email) current with your provider at all times.",
        "If you are under 18, you must live with an approved guardian or with a parent/relative approved by your provider.",
      ]} />
    </Section>

    <Section title="Before You Depart from Nepal" icon={FileCheck}>
      <RuleList items={[
        "Obtain your Confirmation of Enrolment (CoE) letter from your institution before applying for the visa.",
        "Take out OSHC and save your policy document and certificate number.",
        "Carry your original academic transcripts, IELTS/PTE score report, and acceptance letter in your carry-on.",
        "Declare all food items, plant material, and large sums of cash (AUD 10,000+) at Australian customs.",
        "Do not carry any items prohibited under Australian biosecurity laws — fines are substantial.",
      ]} />
    </Section>

    <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
      <strong className="text-black">Need help?</strong> Contact the Department of Home Affairs at{" "}
      <a href="https://immi.homeaffairs.gov.au" target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline">
        immi.homeaffairs.gov.au
      </a>{" "}
      or speak to your Transit Education counsellor for personalised guidance.
    </div>
  </div>
);

/* ─── UK ─── */
const UKContent = (
  <div>
    <p className="text-gray-600 text-sm leading-relaxed mb-8">
      UK Student Visa (formerly Tier 4) holders must comply with conditions set by UK Visas and Immigration (UKVI). Your sponsoring institution is legally obliged to monitor your attendance and report any breach to the Home Office.
    </p>

    <Section title="Enrolment & Attendance" icon={BookOpen}>
      <RuleList items={[
        "You must be enrolled full-time in the course for which your visa was granted.",
        "Attend all timetabled sessions. Your sponsor monitors attendance and must report absences exceeding 10 consecutive contact days.",
        "You cannot switch to a different course or institution without a new CAS (Confirmation of Acceptance for Studies) and, in most cases, a new visa.",
        "If you defer or interrupt your studies, your sponsor must report this to UKVI and your leave may be curtailed.",
        "Complete your course within the visa validity period. Extensions require a new visa application before your current leave expires.",
      ]} />
    </Section>

    <Section title="Work Rights" icon={Briefcase}>
      <RuleList items={[
        "You may work up to 20 hours per week during term time if your course is at degree level or above.",
        "If your course is below degree level, your work allowance is 10 hours per week during term time.",
        "You can work full-time during official vacation periods defined by your institution — not self-declared breaks.",
        "You cannot be self-employed, take a full-time permanent job, or work as a professional sportsperson or entertainer.",
        "Work on a student visa must be secondary to your studies — the Home Office monitors NI records.",
      ]} />
      <WarnBox>
        Check your visa vignette and BRP card carefully — your specific work conditions are printed there. Some visas carry restrictions beyond the standard rules.
      </WarnBox>
    </Section>

    <Section title="Biometric Residence Permit (BRP)" icon={CreditCard}>
      <RuleList items={[
        "If you arrive on a visa valid for more than 6 months, collect your BRP within 10 days of arrival — or before your visa vignette expires (whichever is sooner).",
        "Your BRP is your primary proof of right to work and study in the UK. Keep it safe.",
        "Lost or stolen BRP must be reported to the police and to UKVI — replace it promptly.",
        "Your BRP expiry date may differ from your visa leave expiry date. Your leave is what matters legally.",
      ]} />
    </Section>

    <Section title="NHS Surcharge & Healthcare" icon={ShieldCheck}>
      <RuleList items={[
        "You pay the Immigration Health Surcharge (IHS) when applying for your visa — this gives you access to NHS services.",
        "Register with a local GP (general practitioner) as soon as possible after arriving.",
        "Mental health services, A&E, and most GP visits are free at the point of use once you have paid the surcharge.",
        "Dental and optical care are not fully covered — budget accordingly.",
      ]} />
    </Section>

    <Section title="Before You Depart from Nepal" icon={FileCheck}>
      <RuleList items={[
        "Keep your CAS number, passport, financial evidence, and IELTS/UKVI-approved English test results accessible.",
        "Check the BRP collection point stated in your visa — usually your university's international office.",
        "Open a UK bank account early — many landlords and employers require it. Some banks allow pre-arrival applications.",
        "Register your address with your local council and, if required by your visa, with the police (Police Registration).",
      ]} />
    </Section>

    <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
      <strong className="text-black">Official source:</strong>{" "}
      <a href="https://www.gov.uk/student-visa" target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline">
        gov.uk/student-visa
      </a>{" "}
      — always check for the latest rules before your departure.
    </div>
  </div>
);

/* ─── USA ─── */
const USAContent = (
  <div>
    <p className="text-gray-600 text-sm leading-relaxed mb-8">
      F-1 visa holders are regulated by the Student and Exchange Visitor Program (SEVP). Your status is tracked in the SEVIS database. Maintaining lawful F-1 status is your personal responsibility — your Designated School Official (DSO) is your primary compliance contact.
    </p>

    <Section title="Full-Time Enrollment Requirement" icon={BookOpen}>
      <RuleList items={[
        "Undergraduate students must carry a minimum of 12 credit hours per semester.",
        "Graduate students must meet their program's full-time definition — typically 9 credit hours.",
        "You may not drop below full-time without prior authorisation from your DSO. Reduced course loads require DSO approval and documented reasons (medical, final semester, or academic difficulty).",
        "Online classes: no more than 3 credit hours (1 class) of your full-time load may be online per semester.",
        "You must register and maintain full-time status every semester your I-20 is active, including summer if your program requires it.",
      ]} />
      <WarnBox>
        Falling below full-time without DSO authorisation immediately invalidates your F-1 status. You cannot continue working or studying legally until status is reinstated.
      </WarnBox>
    </Section>

    <Section title="Work Rights" icon={Briefcase}>
      <RuleList items={[
        "On-campus employment: up to 20 hours per week while classes are in session; full-time during official school breaks.",
        "Off-campus employment (CPT — Curricular Practical Training): authorised by your DSO for internships directly related to your major. Must have CPT on your I-20 before starting work.",
        "OPT (Optional Practical Training): up to 12 months post-completion. STEM degree holders may apply for a 24-month STEM OPT extension.",
        "Economic hardship employment: available only after 1 year of study, with USCIS authorisation.",
        "You must never work off-campus without explicit SEVIS authorisation — this is a serious visa violation.",
      ]} />
    </Section>

    <Section title="SEVIS & Reporting Obligations" icon={FileCheck}>
      <RuleList items={[
        "Report any change of address to your DSO within 10 days of moving.",
        "Report any change of major, degree level, or program end date to your DSO immediately.",
        "If you transfer to another SEVP-certified school, your DSO must initiate a SEVIS transfer before you leave your current institution.",
        "Your I-20 must be kept current — request a new one if your program end date changes or if it expires.",
        "Travel outside the USA: your I-20 must be signed by your DSO within 12 months before re-entry.",
      ]} />
    </Section>

    <Section title="Grace Periods & Status" icon={Clock}>
      <RuleList items={[
        "After your program end date, you have a 60-day grace period to prepare for departure, transfer, or change of status.",
        "After completing OPT, you have a 60-day grace period (or 30 days after a STEM OPT extension).",
        "You may enter the USA up to 30 days before your program start date listed on your I-20.",
        "If your visa expires while you are in valid F-1 status inside the USA, you may remain. You need a new visa only to re-enter after leaving.",
      ]} />
    </Section>

    <Section title="Before You Depart from Nepal" icon={Home}>
      <RuleList items={[
        "Receive your I-20 form from your institution and pay the SEVIS fee (Form I-901) before your visa interview.",
        "Bring originals of: I-20, SEVIS fee receipt, financial proof, IELTS/TOEFL, offer letter, and transcripts to your visa interview.",
        "Book your DS-160 appointment at the US Embassy Kathmandu well in advance — wait times can be 4–8 weeks.",
        "Plan to arrive no earlier than 30 days before your I-20 program start date.",
      ]} />
    </Section>
  </div>
);

/* ─── Canada ─── */
const CanadaContent = (
  <div>
    <p className="text-gray-600 text-sm leading-relaxed mb-8">
      Your Canadian study permit carries specific conditions you must follow throughout your studies. Immigration, Refugees and Citizenship Canada (IRCC) can revoke your permit and require you to leave Canada if you breach these conditions.
    </p>

    <Section title="Study Permit Conditions" icon={BookOpen}>
      <RuleList items={[
        "You must be enrolled at a Designated Learning Institution (DLI) at all times. You cannot study at a non-DLI school.",
        "You must actively pursue your studies — you cannot be on leave unless your institution and IRCC approve it.",
        "Notify IRCC if you change your institution or program of study.",
        "If you take a leave of absence longer than 150 days, your study permit conditions may be considered breached.",
        "You must leave Canada when your study permit expires — do not overstay.",
      ]} />
      <InfoBox>
        A study permit is not a visa. You need a separate Temporary Resident Visa (TRV) or Electronic Travel Authorisation (eTA) to enter Canada. Check which applies to your passport.
      </InfoBox>
    </Section>

    <Section title="Work Rights (Off-Campus)" icon={Briefcase}>
      <RuleList items={[
        "As of November 15, 2024, off-campus work is limited to 24 hours per week while classes are in session.",
        "During scheduled breaks (winter break, summer break) you may work full-time with no hour cap — provided you are enrolled in the following academic term.",
        "Your study permit must explicitly state that you are authorised to work off-campus. Most study permits issued after 2015 include this automatically.",
        "Co-op or internship work requires a separate co-op work permit in addition to your study permit.",
        "Post-Graduation Work Permit (PGWP): apply within 180 days of receiving your final marks. Permits you to work in Canada for up to 3 years.",
      ]} />
      <WarnBox>
        Working more than 24 hours/week during a session is a study permit violation, even if it is a paid internship. Always confirm the nature of your work term with your institution.
      </WarnBox>
    </Section>

    <Section title="SIN & Tax" icon={CreditCard}>
      <RuleList items={[
        "Apply for a Social Insurance Number (SIN) at Service Canada once you have your study permit and DLI enrolment confirmation.",
        "Your SIN is required for any paid employment in Canada.",
        "File a Canadian tax return (T1 General) by April 30 each year — even if you earned nothing. First-year students typically receive a tuition tax credit.",
        "Keep all T4 slips from employers — you will need them for your tax filing.",
      ]} />
    </Section>

    <Section title="Health Coverage" icon={ShieldCheck}>
      <RuleList items={[
        "Provincial health coverage for international students varies: Ontario covers students after 3 months; Quebec, BC, and Alberta have immediate coverage for some; other provinces do not cover students at all.",
        "Purchase private health insurance (e.g., Guard.me, Destination Canada) to cover the waiting period or if your province does not offer public coverage.",
        "Your institution's student union often provides supplemental health and dental plans — enrol at the start of term.",
      ]} />
    </Section>

    <Section title="Before You Depart from Nepal" icon={FileCheck}>
      <RuleList items={[
        "Apply for your study permit online at IRCC's portal — include your Letter of Acceptance, proof of funds, and Nepali police clearance.",
        "Funds requirement: CAD 10,000 per year of study (plus first year's tuition and return airfare) — have bank statements for at least 4 months.",
        "If your biometrics are more than 10 years old, you will need to provide new ones.",
        "Carry originals of your study permit approval letter, acceptance letter, and financial proof to the port of entry.",
      ]} />
    </Section>
  </div>
);

/* ─── Others ─── */
const OthersContent = (
  <div>
    <p className="text-gray-600 text-sm leading-relaxed mb-8">
      Compliance requirements vary significantly between countries. Below are key rules for the most popular destinations beyond the Big Four. Contact your Transit Education counsellor for country-specific details before you travel.
    </p>

    {/* Germany */}
    <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🇩🇪</span>
        <h3 className="text-lg font-bold text-black">Germany</h3>
      </div>
      <RuleList items={[
        "Open a blocked account (Sperrkonto) before applying for your visa — minimum €11,208 per year (2026 rate). Allianz Care, Expatrio, and Coracle are popular providers.",
        "Register your address (Anmeldung) at the local Bürgeramt within 14 days of moving into your flat.",
        "Apply for your Aufenthaltstitel (residence permit) at the local Ausländerbehörde within 90 days of arriving.",
        "Work rights: up to 120 full days or 240 half-days per year. This equates to roughly 20 hours/week for part of the year.",
        "Most state universities charge no tuition — only a semester fee (€150–350) covering public transport and admin.",
        "Health insurance is mandatory. Statutory (GKV) plans like TK or AOK accept students under 30 at around €110/month.",
      ]} />
      <WarnBox>
        Your student visa does not automatically allow you to work — check your visa sticker for work authorisation before starting any employment.
      </WarnBox>
    </div>

    {/* Ireland */}
    <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🇮🇪</span>
        <h3 className="text-lg font-bold text-black">Ireland</h3>
      </div>
      <RuleList items={[
        "Register with the Garda National Immigration Bureau (GNIB) / Irish Registration Office within 90 days of arrival — you will receive an Irish Residence Permit (IRP) card.",
        "Renew your IRP before it expires each year — queues at the Dublin office can be long; book online early.",
        "Work rights: up to 20 hours per week during term time; 40 hours during June–September and over Christmas/Easter.",
        "You must be enrolled full-time at an ILEP (International Education Mark) or IUA institution to maintain your immigration permission.",
        "Report any change of address to the Immigration Service Delivery (ISD) within a reasonable timeframe.",
      ]} />
    </div>

    {/* New Zealand */}
    <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🇳🇿</span>
        <h3 className="text-lg font-bold text-black">New Zealand</h3>
      </div>
      <RuleList items={[
        "Student visa holders may work up to 20 hours per week during term time and full-time during scheduled holidays.",
        "You must remain enrolled full-time at your approved institution throughout your visa period.",
        "NZQA (New Zealand Qualifications Authority) monitors your institution's quality — check your institution is NZQA-registered.",
        "Notify Immigration New Zealand within 3 working days if you change your residential address.",
        "Post-study work visa (Graduate visa) available for 1–3 years depending on your qualification level and region of study.",
      ]} />
    </div>

    {/* South Korea */}
    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🇰🇷</span>
        <h3 className="text-lg font-bold text-black">South Korea</h3>
      </div>
      <RuleList items={[
        "Hold a D-2 student visa for degree programs (Bachelor's, Master's, Doctorate) at Korean universities.",
        "Register at your local Immigration Office (Hikorea.go.kr) within 90 days of entry to receive your Alien Registration Card (ARC).",
        "Work rights: part-time work requires prior approval from the immigration office. Typical allowance is 20 hours/week during semesters.",
        "Maintain GPA requirements set by your institution — failing grades can affect your visa renewal.",
        "Korean language proficiency (TOPIK Level 3+ for degree programs at some universities) may be required — check your institution's requirements.",
        "Korean National Health Insurance (KNHI) is mandatory for stays over 6 months — deducted from your student registration.",
      ]} />
      <InfoBox>
        Some universities require first-year international students to live in campus dormitories. Factor this into your accommodation budget.
      </InfoBox>
    </div>

    <div className="mt-8 p-5 bg-brand/5 border border-brand/10 rounded-2xl text-sm text-gray-700 leading-relaxed">
      <strong className="text-black">Destinations not listed above?</strong> Transit Education has counsellors experienced with Italy, Japan, Malaysia, and other emerging study destinations.{" "}
      <a href="/contact" className="text-brand font-semibold hover:underline">Contact us</a>{" "}
      for country-specific guidance tailored to your situation.
    </div>
  </div>
);

const TABS: CountryTab[] = [
  { id: "australia", label: "Australia", flag: "🇦🇺", content: AustraliaContent },
  { id: "uk",        label: "UK",        flag: "🇬🇧", content: UKContent },
  { id: "usa",       label: "USA",       flag: "🇺🇸", content: USAContent },
  { id: "canada",    label: "Canada",    flag: "🇨🇦", content: CanadaContent },
  { id: "others",    label: "Others",    flag: "🌍", content: OthersContent },
];

export default async function CompliancePage() {
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('page_path', 'compliance')
    .eq('status', 'published')
    .order('display_order', { ascending: true });

  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <main className="pt-20">
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {/* Hero */}
      <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-28 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-35">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1920&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />

        <div className="container relative z-10">
          <SectionLabel className="text-white border-white/20 bg-white/10">
            Student Compliance
          </SectionLabel>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mt-6 mb-5 max-w-2xl leading-tight tracking-tight">
            Know Your Rights &amp; Responsibilities
          </h1>
          <p className="text-gray-300 text-lg max-w-xl leading-relaxed mb-10">
            Every country has its own rules for international students — visa
            conditions, work limits, enrolment requirements. This guide covers
            what you need to stay compliant, country by country.
          </p>

          <div className="flex flex-wrap gap-3">
            {HERO_FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full px-4 py-2"
              >
                <Icon className="w-4 h-4 text-brand shrink-0" />
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CountryTabs tabs={TABS} defaultTab="australia" />

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <section className="py-24 bg-off-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <SectionLabel>FAQ</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4">Frequently Asked Questions</h2>
              </div>
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
                <FAQAccordion items={faqs.map(f => ({ ...f, featured: f.is_featured }))} />
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
