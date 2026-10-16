/**
 * Single source of truth for /services/nri-property-investment.
 *
 * Provenance, per block (same convention as services/liaisoning/content.ts):
 *   - LEGACY   copied from the original page (NriView.tsx). Only spelling fixed.
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
  title: "NRI Property Investment in Coimbatore | Majestan Realty",
  description:
    "Majestan Realty helps NRIs buy, finance and manage property in Coimbatore: property identification, legal and documentation support, NRI home loans, property management, and repatriation of sale proceeds under RBI guidelines.",
  keywords: [
    "NRI property investment Coimbatore",
    "NRI real estate services",
    "buy property in India from abroad",
    "NRI home loan Coimbatore",
    "NRI property management",
    "repatriation of sale proceeds",
    "NRI property legal support",
  ],
  canonical: "/services/nri-property-investment",
};

export const HERO: ServiceHeroContent = {
  /** NEW — the legacy page opened on "Advantages of Majestan Realty for NRIs". */
  titleLines: ["Property Investment", "for NRIs, Made Simple"],
  /** LEGACY — verbatim. */
  description:
    "Majestan Realty stands out as the preferred choice for Non-Resident Indians (NRIs) seeking lucrative real estate investments in India. With a strong commitment to transparency, world-class properties, and seamless processes, Majestan Realty ensures a hassle-free experience for NRIs.",
  image: "/assets/images/nri/avt-for-nri.jpg",
  imageAlt:
    "House keys and model homes beside a property agreement being signed",
  imageWidth: 4269,
  imageHeight: 2400,
};

export const ADVANTAGES_INTRO: SectionIntro = {
  /** LEGACY */
  title: "Advantages of Majestan Realty for NRIs",
  /** NEW */
  description:
    "Everything an NRI investment needs, from choosing the property to bringing the money home.",
};

/** LEGACY titles and copy; the last had a stray "Property Ide" fragment, removed. */
export const ADVANTAGES: ServiceOffer[] = [
  {
    title: "Property Identification",
    body: "Expert insights into the best real estate locations for NRIs.",
  },
  {
    title: "Legal & Documentation Support",
    body: "Compliance with Indian property laws for NRIs.",
  },
  {
    title: "Loan & Financial Assistance",
    body: "Collaboration with top banks and institutions.",
  },
  {
    title: "Property Management",
    body: "Transparent updates and financial reporting.",
  },
  {
    title: "Repatriation of Funds",
    body: "Support with the repatriation of sale proceeds, ensuring compliance with RBI guidelines.",
  },
];

/** NEW — for client review. */
export const PROCESS: ProcessContent = {
  title: "Investing from abroad, step by step",
  description:
    "Most of it can be done without travelling to India. We tell you up front which steps can't.",
  steps: [
    {
      title: "Shortlist from wherever you are",
      body: "Tell us your budget, purpose and preferred areas. We shortlist properties that fit, and send video walkthroughs and site reports so you can compare them remotely.",
    },
    {
      title: "Verify and document",
      body: "Title, approvals and RERA registration are checked before you commit. We prepare the agreement and coordinate the power of attorney if someone will sign for you in India.",
    },
    {
      title: "Finance and register",
      body: "We work with partner banks on an NRI home loan, and coordinate the payment through your NRE or NRO account and the registration of the property.",
    },
    {
      title: "Manage, and exit when you choose",
      body: "After the handover we can manage the property, find tenants and send you monthly reports. When you sell, we support the repatriation of the proceeds in line with RBI guidelines.",
    },
  ],
};

/** First two Q&As LEGACY (expanded); the rest NEW — for client review. */
export const FAQ: FaqContent = {
  title: "NRI questions",
  items: [
    {
      question:
        "What are the legal requirements for NRIs to buy property in India?",
      answer:
        "NRIs can purchase residential and commercial properties in India, subject to certain regulations. Agricultural land, farmhouses and plantation property generally cannot be bought by NRIs and need to be inherited instead. We confirm what applies to your purchase before you commit.",
    },
    {
      question: "How can I finance my property purchase from abroad?",
      answer:
        "Several banks offer home loans to NRIs, and we can help you find suitable options. Our financial assistance team works with partner banks on eligibility, documents and approval.",
    },
    {
      question: "Do I need to be in India to buy property?",
      answer:
        "Not necessarily. Shortlisting, verification and loan processing can be done remotely, and a power of attorney can let someone you trust sign and register on your behalf. We will tell you if any step needs you in person.",
    },
    {
      question: "Who looks after the property after I buy it?",
      answer:
        "We can. Our property management service covers tenants, rent collection, maintenance, property tax and utility bills, with monthly statements sent to you.",
    },
    {
      question: "Can I take the money back abroad when I sell?",
      answer:
        "Sale proceeds can be repatriated within the limits set by RBI guidelines. We support the process so the paperwork is in order when you sell.",
    },
  ],
};

/** NEW — for client review. */
export const CTA: CtaContent = {
  title: "Tell us what you're looking for",
  description:
    "Send your budget and the kind of property you want in Coimbatore. We'll call back at a time that suits your time zone, or reply on WhatsApp.",
  messageLabel: "What are you looking for?",
  messagePlaceholder:
    "e.g. 2BHK for rental income near Avinashi Road, budget ₹70L; I live in Singapore",
  submitLabel: "Request a callback",
  whatsappText:
    "Hi Majestan Realty, I'm an NRI looking to invest in property in Coimbatore.",
  teamName: "Our NRI desk",
  source: "nri_cta",
};
