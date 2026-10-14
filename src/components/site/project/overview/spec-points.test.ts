import { describe, expect, it } from "vitest";
import { specPoints } from "./spec-points";

describe("specPoints", () => {
  it("reads one point per line, capped at five", () => {
    expect(specPoints("a\nb\n\n- c\nd\ne\nf")).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("splits a legacy paragraph into its sentences", () => {
    expect(specPoints("Teak frames. UPVC windows with MS grills.")).toEqual([
      "Teak frames.",
      "UPVC windows with MS grills.",
    ]);
  });

  it("keeps a single short value as one point", () => {
    expect(specPoints("Vitrified tiles")).toEqual(["Vitrified tiles"]);
  });
});
