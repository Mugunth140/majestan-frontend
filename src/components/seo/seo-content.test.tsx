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
  SeoLocalityBottom,
  SeoLocalityContent,
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
  it("hides the snapshot while preserving introduction", () => {
    const html = renderToStaticMarkup(
      <SeoLocalityContent
        seo={{
          show_live_market_snapshot: false,
          intro_content: "Local guide",
          stats: { total: 12 },
        }}
      />,
    );
    expect(html).toContain("Local guide");
    expect(html).not.toContain("Live inventory snapshot");
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
  it("retains unavailable inventory without claiming an active offer", () => {
    const html = renderToStaticMarkup(
      <SeoOffMarketPage
        seo={{
          path: "/retained",
          off_market: true,
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
    expect(html).toContain("<figcaption>Entrance</figcaption>");
    expect(html).not.toContain("InStock");
  });
});
