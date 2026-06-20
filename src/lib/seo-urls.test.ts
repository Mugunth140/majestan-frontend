import { describe, expect, test } from "vitest";
import { parseListingUrl, LISTING_TYPES, PROPERTY_TYPES } from "./seo-urls";

describe("parseListingUrl", () => {
  test("returns null for invalid listing type", () => {
    const result = parseListingUrl("invalid-type", "apartments", ["chennai"]);
    expect(result).toBeNull();
  });

  test("returns null for invalid property type", () => {
    const result = parseListingUrl(LISTING_TYPES.SELL, "invalid-property-type", ["chennai"]);
    expect(result).toBeNull();
  });

  test("parses valid sell listing correctly", () => {
    const result = parseListingUrl(LISTING_TYPES.SELL, "apartments", ["chennai", "anna-nagar"]);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      apiListingType: "Sell",
      apiPropertyType: "apartment",
      propertyLabel: "Apartments",
      city: "chennai",
      locality: "anna nagar",
      fullLocation: "chennai anna-nagar",
    });
  });

  test("parses valid rent listing correctly", () => {
    const result = parseListingUrl(LISTING_TYPES.RENT, "villas", ["bangalore", "whitefield"]);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      apiListingType: "Rent",
      apiPropertyType: "villa",
      propertyLabel: "Villas",
      city: "bangalore",
      locality: "whitefield",
      fullLocation: "bangalore whitefield",
    });
  });

  test("defaults city to coimbatore if no location segments are provided", () => {
    const result = parseListingUrl(LISTING_TYPES.SELL, "plots", []);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      apiListingType: "Sell",
      apiPropertyType: "plot",
      propertyLabel: "Plots",
      city: "coimbatore",
      locality: undefined,
      fullLocation: "",
    });
  });

  test("handles empty string location segment correctly", () => {
    const result = parseListingUrl(LISTING_TYPES.SELL, "plots", [""]);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      apiListingType: "Sell",
      apiPropertyType: "plot",
      propertyLabel: "Plots",
      city: "coimbatore", // Falls back to coimbatore because "" is falsy
      locality: undefined,
      fullLocation: "",
    });
  });

  test("handles multiple location segments correctly", () => {
    const result = parseListingUrl(LISTING_TYPES.SELL, "commercial-spaces", ["mumbai", "bandra-west", "some-other-segment"]);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      apiListingType: "Sell",
      apiPropertyType: "commercial",
      propertyLabel: "Commercial Spaces",
      city: "mumbai",
      locality: "bandra west",
      fullLocation: "mumbai bandra-west some-other-segment",
    });
  });
});
