import { describe, expect, it } from "vitest";
import { isSinglePageType, SINGLE_PAGE_TYPES } from "./seo-urls";

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
