import { describe, expect, it } from "vitest";
import { decodeRouteSegment, isSinglePageType, SINGLE_PAGE_TYPES } from "./seo-urls";

describe("isSinglePageType", () => {
  it.each(["plot", "farmland", "commercial", "industrial", "coworking", "other"])(
    "treats %s as single-page",
    (t) => expect(isSinglePageType(t)).toBe(true)
  );
  it.each(["apartment", "villa", "individual_portion"])(
    "treats %s as multi-page",
    (t) => expect(isSinglePageType(t)).toBe(false)
  );
  it("has exactly the six single-page apiValues", () => {
    expect([...SINGLE_PAGE_TYPES].sort()).toEqual(
      ["commercial", "coworking", "farmland", "industrial", "other", "plot"]
    );
  });
});

describe("decodeRouteSegment", () => {
  it("decodes percent-encoded params so they match stored slugs", () => {
    expect(decodeRouteSegment("p%26k-heritage-farms-fl028")).toBe("p&k-heritage-farms-fl028");
    expect(decodeRouteSegment("sree-daksha's-praktva-v082")).toBe("sree-daksha's-praktva-v082");
    expect(decodeRouteSegment("plain-slug-ap001")).toBe("plain-slug-ap001");
  });

  it("keeps the raw value when decoding is unsafe or malformed", () => {
    expect(decodeRouteSegment("a%2Fb-ap001")).toBe("a%2Fb-ap001");
    expect(decodeRouteSegment("bad%E0%A4%A-ap001")).toBe("bad%E0%A4%A-ap001");
  });
});
