import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { SeoProperty } from "@/lib/api/property-by-slug";
import { getPropertyFurnishingItems } from "@/lib/property-furnishing";
import { getVisibleSingleSections } from "@/lib/property-sections";
import { PropertyFurnishingSection } from "./PropertyFurnishingSection";
import { AmenitiesSection } from "./sections/AmenitiesSection";

afterEach(cleanup);

const names = ["Sofa", "Beds", "Wardrobes", "Dining table", "TV", "Refrigerator", "Washing machine"];
const property = {
  title: "Listing", propertyType: "apartment", canonicalSlug: "listing-ap1",
  details: { furnished: true },
  furnishings: names.map((name, index) => ({ id: index + 1, furnishingItem: { id: index + 1, name, icon: null } })),
} as SeoProperty;

describe("Property furnishing items", () => {
  it("previews six selected CRM items and links to the complete list", () => {
    render(<PropertyFurnishingSection property={property} preview />);
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.queryByText("Washing machine")).toBeNull();
    expect(screen.getByRole("link", { name: "View all" }).getAttribute("href"))
      .toBe("/listing-ap1/amenities#furnishing");
  });

  it("shows the complete list below amenities on the Amenities page", () => {
    render(<AmenitiesSection property={property} embedded />);
    const items = screen.getByRole("region", { name: "Furnishing items" });
    expect(within(items).getAllByRole("listitem")).toHaveLength(7);
    expect(within(items).getByText("Washing machine")).toBeDefined();
    const amenities = screen.getByRole("region", { name: "Amenities & Features" });
    expect(amenities.compareDocumentPosition(items) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("uses older raw CRM joins, discards missing items and deduplicates names", () => {
    expect(getPropertyFurnishingItems({ ...property, furnishings: undefined, propertyFurnishings: [
      { id: 1, furnishingItem: null },
      { id: 2, furnishingItem: { id: 2, name: "  Sofa  ", icon: "Sofa" } },
      { id: 3, furnishingItem: { id: 3, name: "sofa", icon: null } },
      { id: 4, furnishingItem: { id: 4, name: " ", icon: null } },
    ] })).toEqual([{ key: "id:2", name: "Sofa", icon: "Sofa" }]);
  });

  it("does not infer furniture from a furnished status", () => {
    render(<PropertyFurnishingSection property={{ ...property, furnishings: [] }} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it.each(["plot", "farmland"])("omits furnishing for %s even with stale items", (propertyType) => {
    render(<PropertyFurnishingSection property={{ ...property, propertyType }} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("keeps the Amenities section visible on single-page types with only furnishing items", () => {
    expect(getVisibleSingleSections({ ...property, propertyType: "coworking", amenities: [] }))
      .toContain("amenities");
  });
});
