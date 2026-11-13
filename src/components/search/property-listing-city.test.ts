import { describe, expect, it, vi } from "vitest";
import { createPropertyAdapter } from "./property-listing-adapter";
import { cityChangeHref } from "./PropertyListingShell";
import type { FilterValues } from "./PropertySearchFilters";

vi.mock("@/contexts/LocationContext", () => ({ useLocationContext: () => ({}) }));
vi.mock("@/lib/api", () => ({ searchProperties: vi.fn(), getHomePageData: vi.fn() }));

const base: FilterValues = {
  keyword: "", propertyType: "", listingType: "Sell", location: "",
  minPrice: "", maxPrice: "", minArea: "", maxArea: "", bedrooms: "", facing: "",
  furnishing: "", propertyAge: "", propertyCondition: "",
};
const sync = (init: Parameters<typeof createPropertyAdapter>[0], filters: Partial<FilterValues>, pathname: string) =>
  createPropertyAdapter(init).syncUrl({
    filters: { ...base, ...filters }, sort: "", pathname, searchParams: new URLSearchParams(),
  } as never);

const cityInit = { initialListingType: "Sell" as const, initialPropertyType: "", initialCity: "coimbatore" };
const localityInit = { ...cityInit, initialLocality: "Saravanampatti" };

describe("property listing location URLs", () => {
  it.each(["", "Coimbatore", "coimbatore", "COIMBATORE"])(
    "'All of' (%j) from a locality page goes to the city page, never <city>-<city>",
    (location) => {
      expect(sync(localityInit, { location }, "/properties-for-sale-in-saravanampatti-coimbatore"))
        .toBe("/properties-for-sale-in-coimbatore");
    },
  );

  it("picking a sub-locality from the city page builds the locality URL", () => {
    expect(sync(cityInit, { location: "Sai Baba Colony" }, "/properties-for-sale-in-coimbatore"))
      .toBe("/properties-for-sale-in-sai-baba-colony-coimbatore");
  });

  it("a price change on the city page keeps the current path", () => {
    expect(sync(cityInit, { location: "Coimbatore", minPrice: "100" }, "/properties-for-sale-in-coimbatore"))
      .toBe("/properties-for-sale-in-coimbatore?minPrice=100");
  });

  it("initial filters treat the city as whole-city", () => {
    const adapter = createPropertyAdapter(cityInit);
    expect(adapter.filtersFromParams(new URLSearchParams("location=Coimbatore")).location).toBe("");
    expect(adapter.resetFilters.location).toBe("");
  });
});

describe("navbar city change on a listing page", () => {
  it("moves to the same type in the new city, dropping locality and page", () => {
    expect(cityChangeHref(
      { initialListingType: "Rent", initialPropertyType: "apartment", initialCity: "coimbatore", initialLocality: "Peelamedu", initialBedrooms: 2 },
      "Tiruppur", "minPrice=5&page=3&location=Peelamedu",
    )).toBe("/2-bhk-apartments-for-rent-in-tiruppur?minPrice=5");
  });

  it("does nothing when the city is unchanged (any casing)", () => {
    expect(cityChangeHref(cityInit, "Coimbatore", "")).toBeNull();
  });
});
