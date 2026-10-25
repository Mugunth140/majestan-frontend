import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CoreSeoBoundary } from "./core-seo";
import { SeoFooterContent, SeoH1 } from "./core-heading";
import { getSeo } from "@/lib/seo-engine";
vi.mock("@/lib/seo-engine", async (original) => ({
  ...(await original<typeof import("@/lib/seo-engine")>()),
  getSeo: vi.fn(),
}));

const editorial = {
  h1: "SEO-only heading",
  h2: "SEO-only subheading",
  intro_content: "SEO-only introduction",
  bottom_content: "SEO-only footer",
  highlights: ["SEO-only highlight"],
  settings: { ai_summary: "SEO-only summary", publish_editorial_content: true },
  faqs: [{ question: "SEO-only question?", answer: "SEO-only answer" }],
  json_ld: {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name: "Listing metadata" },
      { "@type": ["FAQPage"], mainEntity: [] },
    ],
  },
};
describe("listing SEO cannot inject copy through the shared footer", () => {
  it.each([
    { path: "/projects", scope: "page" },
    { path: "/villas-for-sale-in-coimbatore", scope: "listing" },
  ])(
    "keeps $path free from SEO copy including FAQs with publication enabled",
    async ({ path, scope }) => {
      vi.mocked(getSeo).mockResolvedValue({ ...editorial, scope });
      const tree = await CoreSeoBoundary({
        path,
        children: (
          <>
            <main>
              <SeoH1>Inventory listing heading</SeoH1>
              <article>Visible listing</article>
            </main>
            <SeoFooterContent />
            <footer>Website footer</footer>
          </>
        ),
      });
      const html = renderToStaticMarkup(tree);
      expect(html).toContain("Inventory listing heading");
      expect(html).toContain("Visible listing");
      expect(html).toContain("Website footer");
      expect(html).toContain("Listing metadata");
      expect(html).toContain("application/ld+json");
      expect(html).not.toContain("SEO-only");
      expect(html).not.toContain("FAQPage");
      expect(html).not.toContain("<details");
    },
  );
  it("also drops standalone FAQ schema on listing pages", async () => {
    vi.mocked(getSeo).mockResolvedValue({
      ...editorial,
      json_ld: { "@type": "FAQPage", mainEntity: [] },
    });
    const html = renderToStaticMarkup(
      await CoreSeoBoundary({
        path: "/projects",
        children: <SeoFooterContent />,
      }),
    );
    expect(html).not.toContain("FAQPage");
    expect(html).not.toContain("SEO-only");
  });
});
