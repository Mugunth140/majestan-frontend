/**
 * Single source of truth for /services/property-management.
 *
 * Provenance, per block (same convention as services/liaisoning/content.ts):
 *   - LEGACY   copied from the original page (PropertyManagementView.tsx, a port
 *              of the CodeIgniter view). Only spelling fixed.
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
  title:
    "Property Management Services in Coimbatore for NRIs | Majestan Realty",
  description:
    "Majestan Realty manages residential, commercial, industrial and farmland property in Coimbatore for NRIs and owners: tenant management, rent collection, maintenance, tax and legal compliance, and monthly financial reporting.",
  keywords: [
    "property management Coimbatore",
    "NRI property management",
    "property management services for NRIs",
    "tenant management Coimbatore",
    "rent collection services",
    "farmland management Coimbatore",
    "commercial property management",
    "Majestan Propcare",
  ],
  canonical: "/services/property-management",
};

export const HERO: ServiceHeroContent = {
  /** LEGACY title, set on two lines. */
  titleLines: ["Property Management", "Tailored for NRIs"],
  /** LEGACY — verbatim, final full stop added. */
  description:
    "Welcome to Majestan Realty, your reliable partner in managing and maintaining your real estate investments in India. Specializing in property management for Non-Resident Indians (NRIs), we take the stress out of owning property remotely, ensuring your investments are well-maintained, profitable, and hassle-free.",
  image: "/assets/images/property-management/property-management-1.png",
  imageAlt:
    "Hands sheltering a model house over a signed property management agreement",
  imageWidth: 400,
  imageHeight: 509,
  secondImage: {
    src: "/assets/images/property-management/property-management-2.png",
    alt: "Owner reviewing property value and improvement figures on a laptop",
  },
};

export const SERVICES_INTRO: SectionIntro = {
  title: "What we manage for you",
  /** LEGACY */
  description:
    "Comprehensive property management designed to maximize your property's value. From tenant screening and rent collection to maintenance and financial reporting, we take care of every detail.",
};

/** LEGACY — all six groups and their points; typos fixed. */
export const SERVICES: ServiceOffer[] = [
  {
    title: "Property Maintenance and Management",
    points: [
      "Regular property inspections to ensure upkeep.",
      "Coordination for repairs, renovations and routine maintenance.",
      "24/7 emergency support for property-related issues.",
    ],
  },
  {
    title: "Tenant Management",
    points: [
      "Marketing your property to attract quality tenants.",
      "Tenant screening, onboarding and lease management.",
      "Collection of rent and timely transfers to your account.",
    ],
  },
  {
    title: "Legal and Compliance Assistance",
    points: [
      "Managing property taxes, utility bills and other statutory obligations.",
      "Ensuring legal compliance with local regulations.",
      "Handling disputes, evictions and legal formalities if needed.",
    ],
  },
  {
    title: "Industrial and Commercial Property Services",
    points: [
      "Leasing and maintenance of industrial and commercial spaces.",
      "Assisting in negotiations and long-term rental agreements.",
      "Facility management for business requirements.",
    ],
  },
  {
    title: "Farmland and Land Parcel Management",
    points: [
      "Oversight of farmlands, including soil maintenance and agricultural leasing.",
      "Facilitating the sale or lease of wholesale land parcels for industries.",
      "Liaisoning for government approvals and compliance for land use.",
    ],
  },
  {
    title: "Comprehensive Financial Reporting",
    points: [
      "Monthly statements detailing income, expenses and maintenance updates.",
      "Transparent account management for easy tracking of your property's performance.",
    ],
  },
];

/** Step titles LEGACY (they were an image, our-process.jpg); step copy NEW. */
export const PROCESS: ProcessContent = {
  title: "How we take over your property",
  description:
    "Five stages from the first call to a property that runs without you having to be in Coimbatore.",
  steps: [
    {
      title: "Initial Consultation",
      body: "Tell us what you own, where it is and what you want from it: steady rent, upkeep while it sits vacant, or preparation for a sale. We agree the scope and the reporting you'll receive.",
    },
    {
      title: "Property Assessment",
      body: "We inspect the property, record its condition with photographs, and check the paperwork: tax receipts, utility accounts, any existing lease and tenant.",
    },
    {
      title: "Execution",
      body: "Repairs are scheduled, the property is listed and tenants are screened, leases are drawn up, and rent, taxes and bills move onto one managed account.",
    },
    {
      title: "Regular Updates",
      body: "Every month you get a statement of income, expenses and maintenance work, with photographs after each inspection, wherever you are in the world.",
    },
    {
      title: "Continued Support",
      body: "Renewals, rent revisions, disputes and emergencies are handled as they come up, with 24/7 support for anything urgent at the property.",
    },
  ],
};

export const REASONS_INTRO: SectionIntro = {
  /** LEGACY */
  title: "Why choose us?",
};

/** LEGACY — all five, verbatim. */
export const REASONS: ServiceOffer[] = [
  {
    title: "Trusted Expertise",
    body: "Our experience in managing diverse property portfolios ensures your investment is in safe hands.",
  },
  {
    title: "End-to-End Support",
    body: "From tenant placement to property maintenance, we handle every aspect of property management so you can focus on your priorities.",
  },
  {
    title: "Transparent Communication",
    body: "We provide regular updates and reports to keep you informed, no matter where you are in the world.",
  },
  {
    title: "Local Presence, Global Perspective",
    body: "Based in India, we understand the local real estate landscape and provide services that meet global standards.",
  },
  {
    title: "Customized Solutions",
    body: "We tailor our property management services to your specific needs, ensuring maximum returns and peace of mind.",
  },
];

/** NEW — for client review. */
export const FAQ: FaqContent = {
  title: "Property management questions",
  items: [
    {
      question:
        "I live abroad. Do I need to come to India to hand over my property?",
      answer:
        "No. The consultation, the agreement and the handover can all be done remotely. We inspect the property, document its condition and send you the report, so you know exactly what we are taking over.",
    },
    {
      question: "What kinds of property do you manage?",
      answer:
        "Apartments, villas and independent houses, commercial and industrial spaces, and farmland and land parcels. Each has its own section above, because each needs different work: tenants and repairs for homes, leases and facility management for commercial space, and soil upkeep, leasing and land-use approvals for farmland.",
    },
    {
      question: "How do I receive the rent?",
      answer:
        "We collect it from the tenant and transfer it to your account, and the monthly statement shows each payment alongside any expenses and maintenance costs taken from it.",
    },
    {
      question: "Who pays for repairs?",
      answer:
        "You do, and nothing beyond routine upkeep goes ahead without your approval. We get the quote, send it to you, coordinate the work once you agree, and the cost appears on that month's statement.",
    },
    {
      question: "Can you handle property tax and utility bills?",
      answer:
        "Yes. Property tax, utility bills and other statutory payments are part of legal and compliance assistance, so nothing lapses while you are away.",
    },
    {
      question: "How is property management charged?",
      answer:
        "It depends on the property type and the services you need. Tell us what you own and where, and we will send you a written proposal with the fee before you commit to anything.",
    },
  ],
};

/** NEW — for client review. */
export const CTA: CtaContent = {
  title: "Tell us about your property",
  description:
    "Send the property type and the location. We'll come back with what managing it would involve and what it would cost, before you commit to anything.",
  messageLabel: "What would you like us to manage?",
  messagePlaceholder:
    "e.g. 3BHK apartment in Saravanampatti, currently vacant; I live in Dubai",
  submitLabel: "Request a callback",
  whatsappText:
    "Hi Majestan Realty, I'd like to discuss property management for my property in Coimbatore.",
  teamName: "Our property management team",
  source: "property_management_cta",
};
