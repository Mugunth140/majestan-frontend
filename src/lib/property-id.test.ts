import { describe, expect, it } from "vitest";
import { propertyIdCandidates } from "./property-id";

describe("propertyIdCandidates", () => {
  it.each([
    ["AP8471", ["AP8471", "AP-8471"]],
    ["ap8471", ["AP8471", "AP-8471"]],
    ["  #ap 8471 ", ["AP8471", "AP-8471"]],
    ["ID: V012", ["V012", "V-012"]],
    ["property id ap8", ["AP8", "AP-8", "AP008"]],
    ["PROP-1712345678901", ["PROP1712345678901", "PROP-1712345678901"]],
  ])("%j looks like a property ID", (input, expected) => {
    expect(propertyIdCandidates(input)).toEqual(expected);
  });

  it.each(["3 bhk peelamedu", "villa", "bhk3", "flat 2", "saravanampatti", "", "abcdefgh123"])(
    "%j is ordinary search text",
    (input) => {
      expect(propertyIdCandidates(input)).toEqual([]);
    },
  );
});
