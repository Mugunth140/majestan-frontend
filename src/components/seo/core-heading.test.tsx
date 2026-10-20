import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SeoHeadingProvider, SeoH1, SeoFooterContent } from "./core-heading";

describe("core SEO SSR provision", () => {
  it("renders the custom heading and provided SEO content before the footer", () => {
    const html = renderToStaticMarkup(
      <SeoHeadingProvider
        heading="Custom service heading"
        footerContent={
          <section>
            <p>Custom service introduction</p>
            <details>
              <summary>Custom question?</summary>
              <p>Custom answer.</p>
            </details>
            <script type="application/ld+json">{'{"@type":"FAQPage"}'}</script>
          </section>
        }
      >
        <main>
          <SeoH1>Default heading</SeoH1>
        </main>
        <SeoFooterContent />
        <footer>Website footer</footer>
      </SeoHeadingProvider>,
    );
    expect(html).toContain("<h1>Custom service heading</h1>");
    expect(html).not.toContain("Default heading");
    expect(html).toContain("Custom service introduction");
    expect(html).toContain("<summary>Custom question?</summary>");
    expect(html).toContain('type="application/ld+json"');
    expect(html.indexOf("Custom service introduction")).toBeLessThan(
      html.indexOf("<footer>"),
    );
    expect(html.split("Custom service introduction")).toHaveLength(2);
  });
  it("renders nothing when no core SEO content is provided", () => {
    expect(renderToStaticMarkup(<SeoFooterContent />)).toBe("");
  });
});
