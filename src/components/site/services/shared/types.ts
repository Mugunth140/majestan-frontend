/**
 * Content shapes shared by the redesigned /services/* pages. Each page keeps
 * its copy in its own content.ts; these components only lay it out, following
 * the liaisoning page's design (services/liaisoning).
 */

export type ServiceSeo = {
  title: string;
  description: string;
  keywords: readonly string[];
  canonical: string;
};

export type ServiceHeroContent = {
  /** Rendered one line per entry so the break is the design's, not the browser's. */
  titleLines: readonly string[];
  description: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  /** Optional companion photo, same size; shown offset beside the first. */
  secondImage?: { src: string; alt: string };
};

export type SectionIntro = {
  title: string;
  description?: string;
};

export type ServiceOffer = {
  title: string;
  /** Either a short paragraph, bullet points, or both. */
  body?: string;
  points?: readonly string[];
};

export type ProcessContent = SectionIntro & {
  steps: readonly { title: string; body: string }[];
};

export type FaqContent = {
  title: string;
  items: readonly { question: string; answer: string }[];
};

export type CtaContent = {
  title: string;
  description: string;
  /** Label above the message field. */
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  /** Pre-filled WhatsApp text. */
  whatsappText: string;
  /** Shown after a successful submit, e.g. "Our property management team". */
  teamName: string;
  /** Lead source recorded in the CRM, e.g. "property_management_cta". */
  source: string;
};
