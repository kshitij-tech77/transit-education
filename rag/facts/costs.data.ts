/**
 * Canonical cost data for the Ask Transit bot.
 *
 * SNAPSHOT of `COST_DATA` and `NPR_RATES` in
 * src/app/(frontend)/tools/cost-calculator/page.tsx. The bot answers every
 * number from here (never from embedded prose), so this must match what the
 * calculator shows.
 *
 * `rag/tests/facts-drift.test.ts` fails if the two diverge. To update: change
 * the calculator, copy the literals here, run `npm run rag:test`. The clean
 * long-term fix is for the calculator to import from this file (one-line
 * change, no behaviour change); it is left as is so the web app stays
 * untouched by the RAG work.
 */

export type CostCountry = 'canada' | 'australia' | 'uk' | 'usa' | 'germany' | 'new-zealand';
export type CostLevel = 'bachelor' | 'master' | 'diploma';

export interface CostData {
  tuitionMin: number;
  tuitionMax: number;
  livingMin: number;
  livingMax: number;
  currency: string;
  currencySymbol: string;
  visaFee: number;
  healthInsurance: number;
  notes: string[];
}

export const COST_DATA: Record<CostCountry, Record<CostLevel, CostData>> = {
  canada: {
    bachelor: {
      tuitionMin: 15000, tuitionMax: 28000, livingMin: 12000, livingMax: 18000,
      currency: "CAD", currencySymbol: "CA$", visaFee: 235, healthInsurance: 800,
      notes: ["Ontario colleges typically CA$8,000–$16,000/yr", "Universities CA$20,000–$35,000/yr", "PGWP work permit after graduation"],
    },
    master: {
      tuitionMin: 20000, tuitionMax: 35000, livingMin: 12000, livingMax: 18000,
      currency: "CAD", currencySymbol: "CA$", visaFee: 235, healthInsurance: 800,
      notes: ["MBA programs CA$30,000–$60,000/yr", "PGWP up to 3 years after graduation", "SDS stream may reduce processing time"],
    },
    diploma: {
      tuitionMin: 8000, tuitionMax: 16000, livingMin: 12000, livingMax: 16000,
      currency: "CAD", currencySymbol: "CA$", visaFee: 235, healthInsurance: 700,
      notes: ["2-year diploma programs most popular", "PGWP issued equal to program length", "Pathway to Bachelor's available"],
    },
  },
  australia: {
    bachelor: {
      tuitionMin: 22000, tuitionMax: 38000, livingMin: 20000, livingMax: 28000,
      currency: "AUD", currencySymbol: "A$", visaFee: 710, healthInsurance: 700,
      notes: ["OSHC (health cover) mandatory — ~A$700/yr", "48 hrs/fortnight work during semester", "2-year graduate work visa after graduation"],
    },
    master: {
      tuitionMin: 28000, tuitionMax: 48000, livingMin: 20000, livingMax: 28000,
      currency: "AUD", currencySymbol: "A$", visaFee: 710, healthInsurance: 700,
      notes: ["Engineering/IT typically A$32,000–$45,000/yr", "Nursing/Medicine higher", "3-year graduate work visa for some fields"],
    },
    diploma: {
      tuitionMin: 15000, tuitionMax: 25000, livingMin: 18000, livingMax: 24000,
      currency: "AUD", currencySymbol: "A$", visaFee: 710, healthInsurance: 600,
      notes: ["VET/TAFE programs typically A$4,000–$22,000/yr", "Pathway to degree programs", "OSHC mandatory"],
    },
  },
  uk: {
    bachelor: {
      tuitionMin: 14000, tuitionMax: 26000, livingMin: 12000, livingMax: 18000,
      currency: "GBP", currencySymbol: "£", visaFee: 490, healthInsurance: 776,
      notes: ["IHS (Immigration Health Surcharge) £776/yr mandatory", "London costs 30–40% higher than outside London", "Graduate Route Visa 2 years after graduation"],
    },
    master: {
      tuitionMin: 16000, tuitionMax: 32000, livingMin: 12000, livingMax: 20000,
      currency: "GBP", currencySymbol: "£", visaFee: 490, healthInsurance: 776,
      notes: ["1-year Master's programs available", "Graduate Route Visa 3 years for postgrad", "MBA at top schools £40,000–£60,000+"],
    },
    diploma: {
      tuitionMin: 10000, tuitionMax: 18000, livingMin: 10000, livingMax: 16000,
      currency: "GBP", currencySymbol: "£", visaFee: 490, healthInsurance: 776,
      notes: ["Foundation and HND programs available", "Pathway to Bachelor's at UK universities", "IHS mandatory for entire visa duration"],
    },
  },
  usa: {
    bachelor: {
      tuitionMin: 18000, tuitionMax: 45000, livingMin: 15000, livingMax: 25000,
      currency: "USD", currencySymbol: "$", visaFee: 350, healthInsurance: 2000,
      notes: ["Community colleges $8,000–$15,000/yr — transfer pathway", "State universities $15,000–$30,000/yr", "OPT work permit 12 months after graduation (STEM: 36 months)"],
    },
    master: {
      tuitionMin: 25000, tuitionMax: 55000, livingMin: 15000, livingMax: 28000,
      currency: "USD", currencySymbol: "$", visaFee: 350, healthInsurance: 2500,
      notes: ["STEM programs eligible for 3-year OPT", "Graduate assistantships may cover tuition", "Ivy League and top-20 schools $50,000–$80,000/yr"],
    },
    diploma: {
      tuitionMin: 8000, tuitionMax: 18000, livingMin: 12000, livingMax: 20000,
      currency: "USD", currencySymbol: "$", visaFee: 350, healthInsurance: 1500,
      notes: ["Community college associate degrees (2 years)", "Transfer to 4-year university common pathway", "F-1 visa required"],
    },
  },
  germany: {
    bachelor: {
      tuitionMin: 0, tuitionMax: 1000, livingMin: 9000, livingMax: 14000,
      currency: "EUR", currencySymbol: "€", visaFee: 75, healthInsurance: 1300,
      notes: ["Public universities: €0 tuition + semester fee €100–€350/semester", "€11,208 blocked account required for visa", "18-month job seeker visa after graduation"],
    },
    master: {
      tuitionMin: 0, tuitionMax: 2000, livingMin: 9000, livingMax: 14000,
      currency: "EUR", currencySymbol: "€", visaFee: 75, healthInsurance: 1300,
      notes: ["APS certificate mandatory for Nepali students", "Most English-taught Master's: no tuition", "DAAD scholarships available"],
    },
    diploma: {
      tuitionMin: 0, tuitionMax: 500, livingMin: 9000, livingMax: 12000,
      currency: "EUR", currencySymbol: "€", visaFee: 75, healthInsurance: 1300,
      notes: ["Ausbildung (vocational training) programs", "Students paid €600–€800/month during training", "Strong job placement rates"],
    },
  },
  "new-zealand": {
    bachelor: {
      tuitionMin: 22000, tuitionMax: 35000, livingMin: 15000, livingMax: 22000,
      currency: "NZD", currencySymbol: "NZ$", visaFee: 330, healthInsurance: 0,
      notes: ["20 hrs/week work during semester", "Post-study work visa up to 3 years", "Health insurance not mandatory but recommended"],
    },
    master: {
      tuitionMin: 26000, tuitionMax: 40000, livingMin: 15000, livingMax: 22000,
      currency: "NZD", currencySymbol: "NZ$", visaFee: 330, healthInsurance: 0,
      notes: ["NZ qualifications highly regarded in Australia", "Pathway to residency available", "Research Master's may have lower fees"],
    },
    diploma: {
      tuitionMin: 14000, tuitionMax: 22000, livingMin: 13000, livingMax: 18000,
      currency: "NZD", currencySymbol: "NZ$", visaFee: 330, healthInsurance: 0,
      notes: ["Graduate diploma programs (1 year) available", "Post-study open work visa possible", "NZQA framework qualifications"],
    },
  },
};

/** Indicative NPR per 1 unit of currency, as used by the calculator. */
export const NPR_RATES: Record<string, number> = {
  CAD: 96,
  AUD: 88,
  GBP: 170,
  USD: 135,
  EUR: 148,
  NZD: 81,
};
