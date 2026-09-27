/**
 * Single source of truth for /contact-us, following the same convention as the
 * liaisoning page: every block records its provenance.
 *
 *   - LEGACY  carried over from the existing ContactHero / ContactInfo /
 *             ContactForm components, which this redesign replaces.
 *   - NEW     written for this redesign.
 *
 * The SEO block and the LocalBusiness schema are NEW in the sense that the page
 * had no metadata at all — it inherited the site-wide title and description,
 * which is a real gap on a page whose whole job is converting.
 */

export const CONTACT_SEO = {
  title: "Contact Majestan Realty | Real Estate in Coimbatore",
  description:
    "Talk to Majestan Realty about buying, selling, renting or managing property in Coimbatore. Call +91 90929 65556, email us, or send a message and our team will get back to you.",
  canonical: "/contact-us",
} as const;

/** LEGACY — verbatim from ContactHero.tsx. */
export const HERO = {
  title: "Let's Get in Touch",
  /**
   * LEGACY — verbatim, minus the "Reach out to us today." tail, which is
   * redundant with the form directly below it and with the H1.
   */
  description:
    "Whether you're looking to buy, sell, or rent a property, our team of experts is ready to assist you.",
} as const;

/** LEGACY — verbatim from ContactInfo.tsx. */
/**
 * LEGACY — verbatim from ContactInfo.tsx. It has no heading of its own: the H1
 * immediately above already reads "Let's Get in Touch", and a second "Get in
 * touch" heading beneath it read as a duplicate rather than a section.
 */
export const INTRO_DESCRIPTION =
  "We are here to answer any questions you may have about our properties or services.";

export const DETAILS = {
  /** LEGACY — verbatim. */
  address: {
    label: "Head office",
    lines: [
      "47/1 Aandal Street, Lakshmipuram Main Rd",
      "Hope College, Coimbatore",
      "Tamil Nadu 641004",
    ],
  },
  phone: { label: "Call us", value: "+91 90929 65556", href: "tel:+919092965556" },
  email: {
    label: "Email us",
    value: "info@majestanrealty.com",
    href: "mailto:info@majestanrealty.com",
  },
  /** LEGACY — verbatim, including the Sunday note. */
  hours: {
    label: "Working hours",
    rows: [
      { days: "Monday – Saturday", time: "9:00 AM – 6:00 PM" },
      { days: "Sunday", time: "Closed, except scheduled viewings" },
    ],
  },
  /** Single-line form for the LocalBusiness schema. */
  streetAddress: "47/1 Aandal Street, Lakshmipuram Main Rd, Hope College",
  addressLocality: "Coimbatore",
  addressRegion: "Tamil Nadu",
  postalCode: "641004",
  addressCountry: "IN",
  /** Schema.org day codes matching the hours above. */
  openingHours: ["Mo-Sa 09:00-18:00"],
} as const;

/** Legacy map query, reused verbatim so the pin lands in the same place. */
export const MAP_QUERY =
  "47/1 Aandal Street, Lakshmipuram Main Rd, Hope College, Coimbatore, Tamil Nadu 641004";

/** NEW — the form previously had no submit handler at all. */
export const FORM = {
  title: "Send us a message",
  description:
    "Tell us what you need and we will route it to the right person. Fields marked with an asterisk are required.",
  submitLabel: "Send message",
  successTitle: "Message sent",
  successBody:
    "Thanks for getting in touch. Our team will get back to you — if it is urgent, call us directly.",
  subjects: [
    "Buying a property",
    "Selling or renting out a property",
    "Post a property",
    "Property management",
    "Liaisoning and approvals",
    "Something else",
  ],
} as const;
