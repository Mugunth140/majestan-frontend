import { describe, expect, it } from "vitest";
import {
  propertySampleVariables,
  propertySeoProfile,
  propertySeoProfiles,
} from "./property-seo-profile";
import { resolveSampleTokens } from "./seo-width-meter";

describe("property-specific SEO guidance", () => {
  it("covers all eight types and the independent house alias", () => {
    expect(Object.keys(propertySeoProfiles)).toHaveLength(8);
    expect(propertySeoProfile("independent_house")).toEqual(
      propertySeoProfile("individual_portion"),
    );
    expect(propertySeoProfile("unknown")).toBeUndefined();
  });
  it.each(["plot", "farmland", "commercial", "industrial", "coworking"])(
    "does not use residential sample tokens for %s",
    (type) => {
      const samples = propertySampleVariables(type, "rent");
      expect(samples.BHK).toBe("");
      expect(
        resolveSampleTokens(
          "{Property_Name} {Property_Type} {Transaction_Type} {BHK}",
          samples,
        ),
      ).not.toContain("Apartment");
      expect(resolveSampleTokens("{Transaction_Type}", samples)).toBe("Rent");
    },
  );
  it("uses residential BHK examples for a villa", () => {
    expect(propertySampleVariables("villa", "buy")).toMatchObject({
      BHK: "3 BHK",
      Property_Type: "Villa",
      Transaction_Type: "Sale",
    });
  });
});
