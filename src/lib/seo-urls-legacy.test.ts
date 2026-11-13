import { describe, expect, it } from "vitest";
import { buildPseoSlug, parseListingUrl } from "./seo-urls";

const redirectTarget = (kind: string, type: string, segments: string[]) => {
  const p = parseListingUrl(kind, type, segments)!;
  return buildPseoSlug(p.apiListingType, p.propertyTypeSlug, p.city, p.locality, p.bedrooms);
};

describe("legacy /for-sale|/for-rent redirects", () => {
  it.each([
    [["coimbatore"], "apartments-for-sale-in-coimbatore"],
    [["coimbatore", "saravanampatti"], "apartments-for-sale-in-saravanampatti-coimbatore"],
    [["coimbatore", "saravanampatti", "2-bhk"], "2-bhk-apartments-for-sale-in-saravanampatti-coimbatore"],
    [["coimbatore", "2-bhk"], "2-bhk-apartments-for-sale-in-coimbatore"],
    [["coimbatore", "coimbatore"], "apartments-for-sale-in-coimbatore"],
    [["coimbatore", "%E0%A4"], "apartments-for-sale-in-e0-a4-coimbatore"],
  ])("%j", (segments, expected) => {
    expect(redirectTarget("for-sale", "apartments", segments)).toBe(expected);
  });
});
