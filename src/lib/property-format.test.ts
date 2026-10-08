import { describe, expect, it } from "vitest";
import {
  formatDescriptionParagraphs,
  formatFurnishing,
  mapFurnishingSelection,
} from "./property-format";

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

describe("formatDescriptionParagraphs", () => {
  it("splits blank-line-separated text into paragraphs", () => {
    expect(formatDescriptionParagraphs("Para one.\n\nPara two.\n\nPara three.")).toBe(
      "<p>Para one.</p><p>Para two.</p><p>Para three.</p>"
    );
  });

  it("turns single line breaks into line breaks", () => {
    expect(formatDescriptionParagraphs("Line one.\nLine two.")).toBe(
      "<p>Line one.<br>Line two.</p>"
    );
  });

  it("normalizes windows line endings", () => {
    expect(formatDescriptionParagraphs("Para one.\r\n\r\nPara two.")).toBe(
      "<p>Para one.</p><p>Para two.</p>"
    );
  });

  it("leaves already-formatted HTML untouched", () => {
    const html = "<p>Para one.</p><p>Para two.</p>";
    expect(formatDescriptionParagraphs(html)).toBe(html);
  });

  it("returns empty input as-is", () => {
    expect(formatDescriptionParagraphs("")).toBe("");
  });
});

describe("formatFurnishing", () => {
  it("hides the row when furnishing was never specified", () => {
    expect(formatFurnishing({ furnished: null })).toBeNull();
    expect(formatFurnishing(null)).toBeNull();
    expect(formatFurnishing(undefined)).toBeNull();
  });
});
