// site/majestan-frontend/src/lib/faq-page-jsonld.test.ts
import { describe, expect, it } from "vitest";
import { buildFaqPageJsonLd } from "./faq-page-jsonld";

const faqs = [
  { question: "Second?", answer: "Two.", section: "overview", sortOrder: 2 },
  { question: "First?", answer: "One.", section: "overview", sortOrder: 1 },
  { question: "", answer: "Empty question.", section: "overview", sortOrder: 0 },
];

describe("buildFaqPageJsonLd", () => {
  it("emits sorted Question nodes with an @id", () => {
    expect(buildFaqPageJsonLd(faqs, "https://example.com/p")).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://example.com/p#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "First?",
          acceptedAnswer: { "@type": "Answer", text: "One." },
        },
        {
          "@type": "Question",
          name: "Second?",
          acceptedAnswer: { "@type": "Answer", text: "Two." },
        },
      ],
    });
  });

  it("returns null when nothing answerable remains", () => {
    expect(buildFaqPageJsonLd([], "https://example.com/p")).toBeNull();
    expect(
      buildFaqPageJsonLd(
        [{ question: "", answer: "", section: "overview", sortOrder: 0 }],
        "https://example.com/p",
      ),
    ).toBeNull();
  });
});
