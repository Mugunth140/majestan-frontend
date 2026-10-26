import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
import { articleContent, ld } from "./blog";
describe("Blog rendering", () => {
  it("renders rich content with stable table of contents anchors and removes unsafe HTML", () => {
    const result = articleContent(
      '<h2>First</h2><h3>Next</h3><script>bad()</script><img src="https://example.com/a.jpg" alt="Home" onerror="bad()"><a href="javascript:bad()">bad</a>',
    );
    expect(result.headings).toEqual([
      { id: "section-1", title: "First" },
      { id: "section-2", title: "Next" },
    ]);
    expect(result.content).toContain('loading="lazy"');
    expect(result.content).not.toMatch(/script|onerror|javascript/);
  });
  it("escapes structured data script boundaries", () => {
    expect(
      ld({ headline: "</script><script>alert(1)</script>" }),
    ).not.toContain("<");
    expect(JSON.parse(ld({ headline: "</script>" })).headline).toBe(
      "</script>",
    );
  });
});
