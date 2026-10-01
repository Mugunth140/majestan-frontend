// site/majestan-frontend/src/lib/faq-page-jsonld.ts
import type { SeoPropertyFaq } from "./api/property-by-slug";

export type FaqJsonLdInput = Pick<
  SeoPropertyFaq,
  "question" | "answer" | "sortOrder"
> & { id?: number; section?: string };

/**
 * FAQPage structured data for property pages. Mirrors the liaisoning
 * service page shape. Only FAQs visible on the page are marked up —
 * callers pass the already section-filtered list — and empty lists yield
 * null so no bare node is emitted.
 */
export function buildFaqPageJsonLd(
  faqs: FaqJsonLdInput[],
  url: string,
): Record<string, unknown> | null {
  const items = [...faqs]
    .filter((f) => f.question?.trim() && f.answer?.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
