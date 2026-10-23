import { describe, it, expect } from "vitest";
import { estimatePixelWidth, resolveSampleTokens } from "./seo-width-meter";
describe("search snippet guidance", () => {
  it("measures proportional glyphs instead of treating character count as width", () => {
    expect(estimatePixelWidth("WWWW")).toBeGreaterThan(
      estimatePixelWidth("iiii"),
    );
    expect(estimatePixelWidth("")).toBe(0);
    expect(
      Math.abs(
        estimatePixelWidth("Title", 40) - estimatePixelWidth("Title", 20) * 2,
      ),
    ).toBeLessThanOrEqual(1);
  });
  it("resolves available sample inventory tokens while preserving unknown tokens", () => {
    expect(
      resolveSampleTokens("{Project_Name} in {Locality}, {City} {Unknown}"),
    ).toBe("Alamo Turin in Gandhipuram, Coimbatore {Unknown}");
  });
});
