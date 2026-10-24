import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RealEstateJsonLd } from "./SeoEditorial";
import { withSeo, seoMetadata } from "@/lib/seo-engine";

afterEach(cleanup);
describe("detail-page SEO stays separate from visible inventory", () => {
  const seo = {
    path: "/inventory",
    meta_title: "Search engine title",
    meta_description: "Search description",
    h1: "SEO heading",
    highlights: ["SEO highlight"],
    faqs: [{ question: "SEO question", answer: "SEO answer" }],
    section_seo: {
      locality: {
        h1: "SEO locality heading",
        intro_text: "SEO section copy",
        categories: [{ title: "SEO category" }],
      },
    },
    settings: {
      intro_content: "SEO introduction",
      bottom_content: "SEO footer",
      ai_summary: "SEO summary",
      nearby_landmarks: [{ name: "SEO landmark" }],
    },
  };
  it.each(["project", "property"])(
    "keeps the %s inventory content and FAQs intact",
    (scope) => {
      const record = {
        title: "Inventory name",
        name: "Inventory name",
        canonicalSlug: "inventory",
        ...(scope === "project"
          ? { projectType: "apartment" }
          : { propertyType: "apartment" }),
        description: "Inventory description",
        faqs: [
          { question: "Inventory FAQ", answer: "Answer", section: "overview" },
        ],
        projectFaqs: [
          { question: "Project FAQ", answer: "Answer", section: "overview" },
        ],
        seo: {
          seoData: {
            locality: { categories: [{ title: "Inventory category" }] },
          },
        },
      };
      const output = withSeo(record, seo);
      expect(output.title).toBe("Inventory name");
      expect(output.name).toBe("Inventory name");
      expect(output.description).toBe("Inventory description");
      expect(output.faqs).toEqual(record.faqs);
      expect(output.projectFaqs).toEqual(record.projectFaqs);
      expect(output.seo.seoData.locality).toEqual(record.seo.seoData.locality);
      expect(seoMetadata(output.seoEngine || null).title).toEqual({
        absolute: "Search engine title",
      });
      const { container } = render(<RealEstateJsonLd record={output} />);
      expect(container.children).toHaveLength(1);
      expect(container.firstElementChild?.tagName).toBe("SCRIPT");
      expect(container.querySelector("script")).toHaveAttribute(
        "type",
        "application/ld+json",
      );
      expect(container.querySelector("h1, h2, p, ul, details")).toBeNull();
      expect(container.textContent).not.toContain("SEO summary");
      expect(container.textContent).not.toContain("SEO question");
    },
  );
});
