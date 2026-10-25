import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("@/components/site/layout/site-header", () => ({
  SiteHeader: () => null,
}));
vi.mock("@/components/site/layout/site-footer", () => ({
  SiteFooter: () => null,
}));
vi.mock("@/components/site/layout/breadcrumbs", () => ({
  Breadcrumbs: () => null,
}));
import {
  SeoEntityDetails,
  SeoListingPage,
  SeoLocalityBottom,
  SeoOffMarketPage,
  TextBlock,
} from "./seo-content";
describe("public SEO content", () => {
  it("renders safe Markdown headings and lists", () => {
    const html = renderToStaticMarkup(
      <TextBlock
        text={"## Connectivity\n\n- School nearby\n- <script>alert(1)</script>"}
      />,
    );
    expect(html).toContain("<h2");
    expect(html).toContain("<ul");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
  it("renders inline Markdown with an explicit link protocol allowlist", () => {
    const html = renderToStaticMarkup(
      <TextBlock
        text={
          "**Strong** and *emphasis* with `inline code` [Guide](/guide) [Site](https://example.test/guide) [Mail](mailto:hello@example.test) [Call](tel:+919092965556) [Unsafe](javascript:evil) [Data](data:text/html,bad) [Network](//evil.test) <img src=x onerror=evil>"
        }
      />,
    );
    expect(html).toContain("<strong>Strong</strong>");
    expect(html).toContain("<em>emphasis</em>");
    expect(html).toContain("<code>inline code</code>");
    expect(html).toContain('href="/guide"');
    expect(html).toContain('href="https://example.test/guide"');
    expect(html).toContain('href="mailto:hello@example.test"');
    expect(html).toContain('href="tel:+919092965556"');
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('href="data:');
    expect(html).not.toContain('href="//');
    expect(html).toContain("[Unsafe](javascript:evil)");
    expect(html).toContain("&lt;img src=x onerror=evil&gt;");
  });
  it("renders entity overrides, zero-distance landmarks and visible FAQs", () => {
    const seo = {
      entity: { builder_name: "Actual Builder" },
      nearby_landmarks: [{ name: "Business park", distance_km: 0 }],
      faqs: [{ question: "Who develops it?", answer: "Actual Builder" }],
    };
    const html = renderToStaticMarkup(
      <>
        <SeoEntityDetails seo={seo} />
        <SeoLocalityBottom seo={seo} />
      </>,
    );
    expect(html).toContain("Actual Builder");
    expect(html).toContain("Business park — 0 km");
    expect(html).toContain("Who develops it?");
    expect(html).toContain("<summary");
  });
  it("keeps listing SEO copy and market statistics out of the public page while retaining inventory and schema", () => {
    const html = renderToStaticMarkup(
      <SeoListingPage
        seo={{
          path: "/apartments-for-sale-in-coimbatore",
          h1: "Apartments for sale",
          h2: "SEO-only subheading",
          intro_content: "SEO-only introduction",
          bottom_content: "SEO-only bottom guide",
          show_live_market_snapshot: true,
          settings: { publish_editorial_content: true },
          stats: { total: 12 },
          faqs: [
            {
              question: "Automatic market FAQ?",
              answer: "An automatic answer",
            },
          ],
          items: [
            {
              id: 1,
              slug: "apartment-one",
              title: "Apartment One",
              type: "apartment",
              price: 8300000,
            },
          ],
          json_ld: {
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "FAQPage" },
              { "@type": "WebPage", name: "Apartments for sale" },
            ],
          },
        }}
      />,
    );
    expect(html).toContain("Apartment One");
    expect(html).toContain('type="application/ld+json"');
    expect(html).not.toContain("Live inventory snapshot");
    expect(html).not.toContain("Automatic market FAQ?");
    expect(html).not.toContain("SEO-only subheading");
    expect(html).not.toContain("SEO-only introduction");
    expect(html).not.toContain("SEO-only bottom guide");
    expect(html).not.toContain("FAQPage");
  });
  it("retains unavailable inventory without claiming an active offer", () => {
    const html = renderToStaticMarkup(
      <SeoOffMarketPage
        seo={{
          path: "/retained",
          off_market: true,
          h1: "SEO-only heading",
          highlights: ["SEO-only highlight"],
          faqs: [{ question: "SEO-only FAQ", answer: "SEO-only answer" }],
          settings: {
            ai_summary: "SEO-only summary",
            intro_content: "SEO-only introduction",
            bottom_content: "SEO-only footer",
          },
          target_snapshot: {
            title: "Retained property",
            description: "Original description",
          },
          media: [
            {
              image_url: "https://cdn.test/photo.jpg",
              key: "p1",
              kind: "image",
            },
          ],
          image_alts: {
            p1: { alt_text: "View of property", caption: "Entrance" },
          },
        }}
      />,
    );
    expect(html).toContain("currently unavailable");
    expect(html).toContain("Original description");
    expect(html).toContain('alt="View of property"');
    expect(html).not.toContain("<figcaption>");
    expect(html).not.toContain("SEO-only");
    expect(html).not.toContain("FAQPage");
    expect(html).not.toContain("InStock");
  });
});
