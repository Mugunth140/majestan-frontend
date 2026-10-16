/**
 * Single source of truth for /services/financial-assistance.
 *
 * Provenance, per block (same convention as services/liaisoning/content.ts):
 *   - LEGACY   copied from the original page (FinancialAssistanceView.tsx).
 *              Only spelling fixed.
 *   - NEW      written for this redesign. Flagged for client review.
 */
import type {
  CtaContent,
  FaqContent,
  ProcessContent,
  SectionIntro,
  ServiceHeroContent,
  ServiceOffer,
  ServiceSeo,
} from "../shared/types";

/** NEW — the legacy page had no title or description of its own. */
export const SEO: ServiceSeo = {
  title: "Home Loan & Financial Assistance in Coimbatore | Majestan Realty",
  description:
    "Home loan assistance in Coimbatore from Majestan Realty: eligibility checks, document lists, and quick approvals through partner banks including HDFC, ICICI, SBI, PNB, IDFC FIRST, Tata Capital and Sundaram Finance.",
  keywords: [
    "home loan assistance Coimbatore",
    "home loan documents required",
    "home loan eligibility",
    "NRI home loan",
    "property loan Coimbatore",
    "Majestan Realty financial assistance",
  ],
  canonical: "/services/financial-assistance",
};

export const HERO: ServiceHeroContent = {
  /** NEW — the legacy title was the bare "FINANCIAL ASSISTANCE". */
  titleLines: ["Home Loans and", "Financial Assistance"],
  /** LEGACY — the page's second paragraph, lightly trimmed. */
  description:
    "Many property deals face challenges due to delayed funding for developers or buyers. Majestan bridges those gaps with quick approvals, flexible loan options and fast closures that keep transactions on track, so you can focus on your real estate goals.",
  image: "/assets/images/finance/finance-1.png",
  imageAlt:
    "Majestan Realty finance advisers reviewing a client's loan documents",
  imageWidth: 400,
  imageHeight: 509,
  secondImage: {
    src: "/assets/images/finance/finance-2.png",
    alt: "Adviser marking up loan figures and charts with a client",
  },
};

export const HIGHLIGHTS_INTRO: SectionIntro = {
  title: "What we negotiate for you",
  /** LEGACY — the page's first paragraph, condensed. */
  description:
    "We manage the paperwork, assist with loan processing, and use what we know of each lender to get you the strongest offer.",
};

/** Titles LEGACY; copy NEW — for client review. */
export const HIGHLIGHTS: ServiceOffer[] = [
  {
    title: "Lowest Interest Rate",
    body: "We compare offers across our partner banks so you start on the best rate you qualify for.",
  },
  {
    title: "Maximum Eligibility",
    body: "Co-applicants and every income source are put to work to raise the amount you can borrow.",
  },
  {
    title: "Maximum Tenure",
    body: "A longer tenure where it suits you, to keep the monthly payment comfortable.",
  },
  {
    title: "Design Your EMI",
    body: "Structure repayments around your income, including step-up options where the bank offers them.",
  },
];

export type DocumentGroup = { title: string; items: readonly string[] };

export const DOCUMENTS_INTRO: SectionIntro = {
  /** LEGACY */
  title: "Home loan documents required",
  /** NEW */
  description:
    "Have these ready and approval moves much faster. We'll check the set before it goes to the bank.",
};

/** LEGACY — the three columns of the "Home Loan Document Required" table. */
export const KYC_DOCUMENTS: DocumentGroup[] = [
  {
    title: "Identity proof (any one)",
    items: ["Driving License", "PAN Card", "Voter ID", "Valid Passport"],
  },
  {
    title: "Residence proof (any one)",
    items: [
      "Copy of Electricity Bill / Water Bill / Telephone Bill",
      "Copy of Valid Passport / Aadhaar Card / Driving License",
    ],
  },
  {
    title: "Other documents",
    items: [
      "Employer Identity Card",
      "Duly filled loan application form affixed with 3 passport size photographs",
      "Loan account statement for the previous 12 months, if the applicant has any other ongoing loan from other banks or financial institutions",
      "Bank account statements for all the bank accounts owned by the applicant for the last six months",
    ],
  },
];

/** LEGACY — the "Income Proof Documents" table. */
export const INCOME_DOCUMENTS: DocumentGroup[] = [
  {
    title: "Salaried applicant / co-applicant",
    items: [
      "Salary slips for the last three months",
      "Copy of Form 16 or Income Tax Returns for the last two years",
    ],
  },
  {
    title: "Self-employed applicant / co-applicant",
    items: [
      "Income Tax Returns for the last 3 years",
      "Certificate of Qualification (for doctors, CAs and other professionals)",
      "Balance sheet audited by a certified CA and Profit and Loss account for the previous 3 years",
      "Business license details proof",
      "Business address proof",
      "TDS Certificate",
    ],
  },
];

export const ELIGIBILITY_INTRO: SectionIntro = {
  /** LEGACY */
  title: "Home loan eligibility",
  /** NEW */
  description:
    "Typical criteria across our partner banks. Each lender sets its own final terms.",
};

/**
 * LEGACY — all six rows. "Person of Indian Origin" was listed under
 * Employment as well as Resident Type; it only belongs under Resident Type.
 */
export const ELIGIBILITY: {
  criterion: string;
  requirement: string;
  options?: readonly string[];
}[] = [
  { criterion: "Age", requirement: "Minimum 18 years, maximum 70 years." },
  {
    criterion: "Resident type",
    requirement: "The applicant must be any one of:",
    options: [
      "Resident Indian",
      "Non-Resident Indian (NRI)",
      "Person of Indian Origin (PIO)",
    ],
  },
  {
    criterion: "Employment",
    requirement: "The applicant must be any one of:",
    options: ["Salaried", "Self-employed"],
  },
  {
    criterion: "Net annual income",
    requirement: "At least ₹5–6 lakh, depending on the type of employment.",
  },
  {
    criterion: "Residence",
    requirement: "The applicant must have any one of:",
    options: [
      "A permanent residence",
      "A rented residence where they have lived for at least a year before applying",
    ],
  },
  {
    criterion: "Credit score",
    requirement: "At least 750, from a recognised credit bureau.",
  },
];

/** LEGACY — all seven logos (468x143). */
export const BANK_PARTNERS = [
  { name: "HDFC Bank", logo: "/assets/images/bank-logo/hdfc.png" },
  { name: "ICICI Bank", logo: "/assets/images/bank-logo/icici.png" },
  { name: "Punjab National Bank", logo: "/assets/images/bank-logo/pnb.png" },
  { name: "State Bank of India", logo: "/assets/images/bank-logo/sbi.png" },
  { name: "Sundaram Finance", logo: "/assets/images/bank-logo/sundharam.png" },
  { name: "Tata Capital", logo: "/assets/images/bank-logo/tata.png" },
  {
    name: "IDFC FIRST Bank",
    logo: "/assets/images/bank-logo/idfc-first-bank.png",
  },
] as const;

/** NEW — for client review. */
export const PROCESS: ProcessContent = {
  title: "From application to disbursal",
  description:
    "We run the loan alongside the property deal, so funding never holds the closing up.",
  steps: [
    {
      title: "Eligibility check",
      body: "We look at your income, existing loans and credit score, and tell you what you can realistically borrow before you commit to a property.",
    },
    {
      title: "Compare lenders",
      body: "Offers from our partner banks are compared on rate, tenure, fees and EMI, and we recommend the one that fits.",
    },
    {
      title: "Documents and application",
      body: "We check your documents against the lists above, fill gaps before submission, and file the application with the bank.",
    },
    {
      title: "Sanction and disbursal",
      body: "We follow the bank through valuation, legal checks and sanction, and coordinate disbursal with the seller or developer so the deal closes on time.",
    },
  ],
};

/** NEW — for client review. */
export const FAQ: FaqContent = {
  title: "Home loan questions",
  items: [
    {
      question: "Can NRIs get a home loan through you?",
      answer:
        "Yes. Non-Resident Indians and Persons of Indian Origin are eligible with our partner banks, and our NRI desk can coordinate the paperwork from abroad.",
    },
    {
      question: "What credit score do I need?",
      answer:
        "Banks typically look for a score of 750 or more from a recognised credit bureau. If yours is lower, talk to us. Some lenders may still consider the application, and we can tell you what would improve it.",
    },
    {
      question: "How much can I borrow?",
      answer:
        "It depends on your income, age, existing loans and the property itself. Adding a co-applicant often raises it. We'll give you a realistic figure at the eligibility check.",
    },
    {
      question: "Can you help developers with funding as well?",
      answer:
        "Yes. Delayed funding holds up developers as often as buyers, and we work with lenders on financing for projects as well as individual purchases.",
    },
    {
      question: "Is there a fee for loan assistance?",
      answer:
        "It depends on the loan and the lender. We'll confirm in writing whether any fee applies to your case before we start work.",
    },
  ],
};

/** NEW — for client review. */
export const CTA: CtaContent = {
  title: "Check your loan eligibility",
  description:
    "Tell us the property you're buying and roughly how much you need. We'll come back with what you can borrow and which banks will offer it.",
  messageLabel: "What do you need financing for?",
  messagePlaceholder:
    "e.g. ₹60L loan for a 3BHK in Vadavalli, salaried, monthly income ₹1.5L",
  submitLabel: "Request a callback",
  whatsappText:
    "Hi Majestan Realty, I'd like help with a home loan for a property in Coimbatore.",
  teamName: "Our finance team",
  source: "financial_assistance_cta",
};
