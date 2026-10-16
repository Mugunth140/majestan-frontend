/**
 * Single source of truth for /services/professional-brokerage-services.
 *
 * Provenance, per block (same convention as services/liaisoning/content.ts):
 *   - LEGACY   copied from the original page (ProfessionalBrokerageServiceView.tsx).
 *   - NEW      written for this redesign. Flagged for client review.
 */
import type { Category } from "../liaisoning/content";
import type {
  CtaContent,
  FaqContent,
  ProcessContent,
  ServiceHeroContent,
  ServiceSeo,
} from "../shared/types";

/** NEW — the legacy page had no title or description of its own. */
export const SEO: ServiceSeo = {
  title: "Real Estate Brokerage Services in Coimbatore | Majestan Realty",
  description:
    "Professional real estate brokerage in Coimbatore from Majestan Realty: buying, selling and leasing residential, commercial, industrial, agricultural and luxury property, plus joint development agreements and investment sales.",
  keywords: [
    "real estate brokerage Coimbatore",
    "property broker Coimbatore",
    "professional brokerage services",
    "commercial property leasing Coimbatore",
    "office leasing Coimbatore",
    "warehouse leasing Coimbatore",
    "farmland for sale Coimbatore",
    "joint development agreement Coimbatore",
    "luxury villas Coimbatore",
  ],
  canonical: "/services/professional-brokerage-services",
};

export const HERO: ServiceHeroContent = {
  /** LEGACY title. */
  titleLines: ["Professional", "Brokerage Service"],
  /** LEGACY — verbatim. */
  description:
    "Discover expert brokerage services with Majestan Realty. From buying and selling to leasing, we connect you with the best opportunities in the market. Trust us for seamless transactions and personalized solutions tailored to your real estate needs.",
  image: "/assets/images/professional/professional-cover.png",
  imageAlt: "Majestan Realty broker's hands around a model house",
  imageWidth: 722,
  imageHeight: 482,
};

/** LEGACY — the five tabs and all fifteen cards, labels verbatim. */
export const SEGMENTS: Category[] = [
  {
    id: "residential",
    label: "Residential",
    items: [
      {
        label: "Buy/Sell Transactions",
        image: "/assets/images/professional/buy_sell.png",
      },
      {
        label: "Rental Transactions",
        image: "/assets/images/professional/rental_transactions.png",
      },
      {
        label: "Plotted Development Transactions",
        image: "/assets/images/professional/plotted_development.png",
      },
      {
        label: "Joint Development Agreements",
        image: "/assets/images/professional/joint_development.png",
      },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    items: [
      {
        label: "Office Leasing & Sale",
        image: "/assets/images/professional/office_leasing_sales.png",
      },
      {
        label: "Retail Leasing & Sales",
        image: "/assets/images/professional/retail_leasing_sales.png",
      },
      {
        label: "Co-working Spaces",
        image: "/assets/images/professional/co_working_spaces.png",
      },
      {
        label: "Property Investment Sales",
        image: "/assets/images/professional/property_investment_sale.png",
      },
    ],
  },
  {
    id: "industrial",
    label: "Industrial",
    items: [
      {
        label: "Warehouse Leasing & Sales",
        image: "/assets/images/professional/werehouse_leasing_sale.png",
      },
      {
        label: "Factory Transactions",
        image: "/assets/images/professional/factory_transactions.png",
      },
      {
        label: "Land for Industrial Development",
        image:
          "/assets/images/professional/land_for_industrial_development.png",
      },
    ],
  },
  {
    id: "agricultural",
    label: "Agricultural",
    items: [
      {
        label: "Buying & Selling Farmland",
        image: "/assets/images/professional/buying_selling_farmland.png",
      },
    ],
  },
  {
    id: "luxury",
    label: "Luxury",
    items: [
      {
        label: "Luxury Villas and Penthouses",
        image: "/assets/images/professional/luxury_villas_and_penthouses.png",
      },
      {
        label: "Second Homes and Vacation Properties",
        image:
          "/assets/images/professional/second_home_and_vacation_properties.png",
      },
      {
        label: "Branded Residences",
        image: "/assets/images/professional/branded_residences.png",
      },
    ],
  },
];

/** NEW */
export const SEGMENTS_INTRO = {
  title: "Transactions we broker",
  description:
    "Residential, commercial, industrial, agricultural and luxury property. Pick a segment to see the deals we handle.",
} as const;

/** NEW — for client review. */
export const PROCESS: ProcessContent = {
  title: "How a deal runs with us",
  description:
    "One broker from the first brief to registration, whether you are buying, selling or leasing.",
  steps: [
    {
      title: "Understand the brief",
      body: "Budget, location, size and timeline if you are buying or renting; price expectations and documents if you are selling or leasing out. We agree what a good outcome looks like before anything is shown or listed.",
    },
    {
      title: "Shortlist or market",
      body: "Buyers and tenants get a shortlist of properties that actually fit the brief. Sellers and landlords get their property presented to the buyers and tenants we already work with, and marketed beyond them.",
    },
    {
      title: "Site visits and negotiation",
      body: "We arrange the visits, compare the options with you, and negotiate price and terms, including lease length, escalation and deposits on commercial and industrial deals.",
    },
    {
      title: "Documentation and closing",
      body: "Title checks, the sale or lease agreement, loan coordination and registration are handled through to the handover of keys, so the deal closes on the terms that were agreed.",
    },
  ],
};

/** NEW — for client review. */
export const FAQ: FaqContent = {
  title: "Brokerage questions",
  items: [
    {
      question: "Do you represent buyers, sellers, or both?",
      answer:
        "Both, as well as landlords and tenants. Tell us which side of the deal you are on and we will work to your brief.",
    },
    {
      question: "Which kinds of property do you broker?",
      answer:
        "Residential homes and plots, commercial offices, retail and co-working space, industrial warehouses, factories and land, farmland, and luxury villas, penthouses and branded residences. The segments above list every transaction type.",
    },
    {
      question: "Do you handle joint development agreements?",
      answer:
        "Yes. We bring landowners and developers together, and support the negotiation and agreement for joint development of residential and plotted projects.",
    },
    {
      question: "Will you verify the property's documents?",
      answer:
        "Yes. Title and approval documents are checked before an agreement is signed. Where approvals are missing or a title needs work, our liaisoning team can take it on.",
    },
    {
      question: "Can you help with a home loan?",
      answer:
        "Yes. Our financial assistance team works with partner banks on loan eligibility, documentation and approval, so financing runs alongside the deal rather than holding it up.",
    },
    {
      question: "What is the brokerage fee?",
      answer:
        "It depends on the type of transaction and the property. We confirm the fee in writing at the start, before any site visit or listing.",
    },
  ],
};

/** NEW — for client review. */
export const CTA: CtaContent = {
  title: "Tell us what you're looking for",
  description:
    "Buying, selling or leasing: send us the property type, the location and your budget or asking price, and a broker will call you back.",
  messageLabel: "What are you looking to do?",
  messagePlaceholder:
    "e.g. Looking to lease 5,000 sq ft of warehouse space near L&T Bypass",
  submitLabel: "Request a callback",
  whatsappText:
    "Hi Majestan Realty, I'd like to talk to a broker about a property in Coimbatore.",
  teamName: "Our brokerage team",
  source: "brokerage_cta",
};
