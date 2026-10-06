import { describe, expect, it } from "vitest";
import { formatFurnishing, mapFurnishingSelection } from "./property-format";

describe("mapFurnishingSelection", () => {
  it("maps Fully Furnished to true + status string", () => {
    expect(mapFurnishingSelection("Furnished")).toEqual({
      furnished: true,
      furnishingStatus: "FULLY FURNISHED",
    });
  });

  it("maps Semi Furnished to true + status string", () => {
    expect(mapFurnishingSelection("Semi Furnished")).toEqual({
      furnished: true,
      furnishingStatus: "SEMI FURNISHED",
    });
  });

  it("maps Unfurnished to false + status string", () => {
    expect(mapFurnishingSelection("Unfurnished")).toEqual({
      furnished: false,
      furnishingStatus: "UNFURNISHED",
    });
  });

  it("maps an untouched select to unknown, not false", () => {
    expect(mapFurnishingSelection(undefined)).toEqual({
      furnished: undefined,
      furnishingStatus: undefined,
    });
    expect(mapFurnishingSelection("")).toEqual({
      furnished: undefined,
      furnishingStatus: undefined,
    });
  });
});

describe("formatFurnishing", () => {
  it("hides the row when furnishing was never specified", () => {
    expect(formatFurnishing({ furnished: null })).toBeNull();
    expect(formatFurnishing(null)).toBeNull();
    expect(formatFurnishing(undefined)).toBeNull();
  });
});
