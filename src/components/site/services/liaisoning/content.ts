/**
 * Single source of truth for the /services/liaisoning page.
 *
 * Provenance matters here, so it is recorded per block:
 *   - LEGACY   copied verbatim from the original CodeIgniter view
 *              (Project/application/views/liaisoning.php), which the now-removed
 *              LiaisoningView.tsx was a byte-identical port of.
 *   - RESTORED recovered from Project/application/controllers/Services.php and
 *              lost when the site was ported to Next.js.
 *   - NEW      written for this redesign from the General Liaisoning table.
 *              Flagged for client review.
 */

export const LIAISONING_SEO = {
  /** RESTORED — was dropped in the Next.js port. */
  title: "Liaisoning Services in Coimbatore | Majestan Realty",
  description:
    "Majestan Realty offers expert liaisoning services in Coimbatore, assisting with property approvals, documentation, DTCP & RERA compliance, and smooth real estate transactions. Partner with us for hassle-free property deals and professional support.",
  keywords: [
    "liaisoning services Coimbatore",
    "Majestan Realty liaisoning",
    "property consultants in Coimbatore",
    "property approvals Coimbatore",
    "DTCP compliance Coimbatore",
    "RERA compliance Coimbatore",
    "property documentation services",
    "real estate liaisoning",
    "smooth property transactions",
    "Coimbatore property services",
  ],
  canonical: "/services/liaisoning",
  /** RESTORED — the old sitemap.xml listed priority 0.85 for this URL. */
  sitemapPriority: 0.85,
} as const;

export const HERO = {
  /** LEGACY — the page had no <h1>; this title shipped as an <h2>. */
  title: "Trusted and Reliable Liaisoning",
  /**
   * LEGACY had a literal <br> after "Reliable" ("Trusted and Reliable /
   * Liaisoning"). Reproduced as explicit lines because the copy alone cannot
   * hold that break: at hero type sizes in a two-column grid the browser wraps
   * it into three ragged lines instead, splitting "Trusted and Reliable" in the
   * middle. Deterministic beats leaving it to the line-breaker.
   */
  titleLines: ["Trusted and Reliable", "Liaisoning"] as const,
  /** LEGACY — verbatim. */
  description:
    "At Majestan Realty, we specialize in seamless liaisoning services to simplify your real estate projects. From approvals to permits, our expert team ensures compliance with all regulatory requirements. We bridge the gap between you and authorities, paving the way for hassle-free development. Trust Majestan Realty for reliable and efficient support.",
  image: "/assets/images/liaisoning/liaisoning.png",
  imageAlt: "Majestan Realty liaisoning consultants meeting an authority official",
} as const;

export type Category = {
  id: string;
  label: string;
  items: { label: string; image: string }[];
};

/**
 * LEGACY — the three widget-tabs and all nineteen cards, labels verbatim.
 * The renders are 600x380 PNGs with transparent backgrounds, so they composite
 * onto any brand tint; no white-box halo.
 */
export const CATEGORIES: Category[] = [
  {
    id: "commercial",
    label: "Commercial Buildings",
    items: [
      { label: "Office Spaces", image: "/assets/images/liaisoning/office_space.png" },
      { label: "Retail Spaces", image: "/assets/images/liaisoning/retail_space.png" },
      {
        label: "Hospitality Buildings",
        image: "/assets/images/liaisoning/hospitality_building.png",
      },
      {
        label: "Mixed-Use Developments",
        image: "/assets/images/liaisoning/mised_use_development.png",
      },
      {
        label: "Healthcare Facilities",
        image: "/assets/images/liaisoning/helth_care_facilitates.png",
      },
      {
        label: "Educational Institutions",
        image: "/assets/images/liaisoning/educational_instutions.png",
      },
      {
        label: "Logistics & Warehousing",
        image: "/assets/images/liaisoning/logistics.png",
      },
    ],
  },
  {
    id: "residential",
    label: "Residential Buildings",
    items: [
      {
        label: "Single-Family Homes",
        image: "/assets/images/liaisoning/single_family_homes.png",
      },
      {
        label: "Apartments and Condominiums",
        image: "/assets/images/liaisoning/apartment_and_condominiums.png",
      },
      { label: "Villas", image: "/assets/images/liaisoning/villa.png" },
      {
        label: "Plotted Developments",
        image: "/assets/images/liaisoning/plotted_developments.png",
      },
      { label: "Affordable Housing", image: "/assets/images/liaisoning/affordable_housing.png" },
      {
        label: "Senior Living Communities",
        image: "/assets/images/liaisoning/senior_living_communities.png",
      },
    ],
  },
  {
    id: "industrial",
    label: "Industrial Buildings",
    items: [
      {
        label: "Manufacturing Units",
        image: "/assets/images/liaisoning/manufacturing_units.png",
      },
      { label: "Warehouses", image: "/assets/images/liaisoning/wherehouses.png" },
      { label: "Logistics Parks", image: "/assets/images/liaisoning/logistics_parks.png" },
      { label: "Cold Storage Facilities", image: "/assets/images/liaisoning/cold_storage.png" },
      { label: "Industrial Parks", image: "/assets/images/liaisoning/industrial_parks.png" },
      { label: "R&D Centers", image: "/assets/images/liaisoning/r_d_center.png" },
    ],
  },
];

export const GENERAL_LIAISONING = {
  /** LEGACY */
  title: "General Liaisoning",
  /** NEW */
  description:
    "Every approval a Coimbatore project needs, and the authority that grants it. This is the scope we cover end to end.",
  columns: ["Aspect", "Authority / Agency Involved", "Purpose"] as const,
  /** LEGACY — all eight rows. Only fix: "taxes,registration" → "taxes, registration". */
  rows: [
    {
      aspect: "Title Verification",
      authority: "Revenue Department",
      purpose: "Ensure legal ownership and an encumbrance-free title.",
    },
    {
      aspect: "Construction Approvals",
      authority: "Municipal Corporation",
      purpose: "Secure permissions for construction, layout and occupancy.",
    },
    {
      aspect: "Environmental Clearance",
      authority: "Pollution Control Board",
      purpose: "Approvals for emissions, waste management, and water usage.",
    },
    {
      aspect: "Utility Connections",
      authority: "Electricity Boards, Water Departments",
      purpose: "Apply for electricity, water, gas, and telecom connections.",
    },
    {
      aspect: "Tax Payments",
      authority: "Revenue Department, GST Authorities",
      purpose: "Payment of property taxes, registration fees and GST compliance.",
    },
    {
      aspect: "Labor and Safety Compliance",
      authority: "Labor Department",
      purpose: "Adherence to safety standards for workers during construction.",
    },
    {
      aspect: "Fire Safety",
      authority: "Fire Department",
      purpose: "NOCs for fire safety in commercial and high-rise buildings.",
    },
    {
      aspect: "RERA Registration",
      authority: "Real Estate Regulatory Authority (RERA)",
      purpose: "Project registration and buyer transparency.",
    },
  ],
} as const;

/** NEW — derived from GENERAL_LIAISONING.rows. For client review. */
export const PROCESS = {
  title: "How liaisoning works",
  description:
    "Four stages, one file. You always know which authority your project is sitting in front of, and what is still outstanding.",
  steps: [
    {
      title: "Consultation and scope",
      body: "Tell us the asset class and the location. Before anyone signs anything, we map the full approval set your project will need across the Municipal Corporation, DTCP, RERA and the utility boards.",
    },
    {
      title: "Title and document verification",
      body: "We verify the title with the Revenue Department, confirm it is encumbrance-free, and check the layout, zoning and FAR against the plan before a single application is filed.",
    },
    {
      title: "Authority submissions",
      body: "Applications go in complete — construction plan, layout approval, NOCs, environmental and fire clearance — and each one is tracked to a written order rather than a verbal assurance.",
    },
    {
      title: "Handover and compliance record",
      body: "You receive the approval set, the utility connections, the tax and registration receipts, and a single organised file of the entire compliance trail.",
    },
  ],
} as const;

/** NEW — derived from GENERAL_LIAISONING.rows. For client review. */
export const FAQ = {
  title: "Liaisoning questions",
  items: [
    {
      question: "What does liaisoning actually cover?",
      answer:
        "Everything between owning a piece of land and being able to build and operate on it: title verification, construction and layout approvals, environmental and fire clearance, utility connections, tax and registration compliance, labor and safety filings, and RERA registration. That is the full list in the table above — we do not subcontract any of it.",
    },
    {
      question: "My project is already DTCP and RERA approved. Do I still need this?",
      answer:
        "Possibly not for the approvals themselves, but the gaps are usually downstream. Utility connections, fire NOCs, occupancy permission, labor and safety compliance, and the tax and registration trail are separate filings that sit outside the DTCP and RERA sanction and still have to be completed before you can occupy or operate the building.",
    },
    {
      question: "Which authorities do you deal with?",
      answer:
        "The Municipal Corporation and DTCP for construction and layout approvals, the Revenue Department for title and property tax, the Pollution Control Board for environmental clearance, the Fire Department for fire NOCs, the Labor Department for site safety, RERA for project registration, and the electricity, water, gas and telecom utilities for connections.",
    },
    {
      question: "Do you verify the title, or just file the applications?",
      answer:
        "We verify it. Title verification is the first row in our table, not an afterthought — we check legal ownership and confirm the land is encumbrance-free with the Revenue Department before we build an application on top of it.",
    },
    {
      question: "How long do approvals take?",
      answer:
        "It varies by asset class, the authority, and how complete the documentation is when it is filed. We will give you an expected timeline per stage during the consultation, and flag anything sitting on the critical path. Incomplete submissions are the single biggest cause of delay, which is why we verify first and file second.",
    },
    {
      question: "How is liaisoning charged?",
      answer:
        "It depends on the scope — the asset class and how many authorities are involved. Send us the project type and location and we will put a written proposal in front of you, with the approval map and the fee broken out, before you commit to anything.",
    },
  ],
} as const;

/** NEW — for client review. */
export const CTA = {
  title: "Tell us what you're building",
  description:
    "Send the asset class and the location. We will come back with the approval map — which authority, which document, and what the realistic path looks like — before you commit to a rupee.",
  phone: "+919092965556",
  phoneDisplay: "+91 90929 65556",
  whatsapp: "919092965556",
  submitLabel: "Request a callback",
} as const;
