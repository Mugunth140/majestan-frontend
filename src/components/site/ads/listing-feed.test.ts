import { describe, expect, it } from "vitest";
import { interleaveAds } from "./listing-feed";

const kinds = (entries: { kind: string }[]) => entries.map((e) => (e.kind === "ad" ? "A" : "i")).join("");

describe("interleaveAds", () => {
  it("places an ad after every 4th card but not after the last", () => {
    expect(kinds(interleaveAds([1, 2, 3, 4, 5, 6, 7, 8, 9], ["x"]))).toBe("iiiiAiiiiAi");
    expect(kinds(interleaveAds([1, 2, 3, 4, 5, 6, 7, 8], ["x"]))).toBe("iiiiAiiii");
  });

  it("still shows one ad at the end of a short page", () => {
    expect(kinds(interleaveAds([1, 2], ["x"]))).toBe("iiA");
    expect(kinds(interleaveAds([1, 2, 3, 4], ["x"]))).toBe("iiiiA");
    expect(kinds(interleaveAds([], ["x"]))).toBe("");
  });

  it("rotates through the ads", () => {
    const ads = interleaveAds([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], ["a", "b"])
      .filter((e) => e.kind === "ad")
      .map((e) => (e.kind === "ad" ? e.ad : null));
    expect(ads).toEqual(["a", "b", "a"]);
  });

  it("returns just the cards when there are no ads", () => {
    expect(kinds(interleaveAds([1, 2, 3, 4, 5], []))).toBe("iiiii");
  });
});
