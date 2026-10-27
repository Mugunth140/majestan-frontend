import { describe, expect, it } from "vitest";
import {
  isRentProperty,
  propertyBreadcrumbItems,
  propertySectionBreadcrumbItems,
} from "./property-breadcrumbs";

const rentOffice = {
  listingType: "Rent",
  status: "available",
  propertyType: "commercial",
  city: "Coimbatore",
  title: "Office Space",
  canonicalSlug: "office-space-for-rent-in-vadakovai-coimbatore-cs004",
};
const saleFlat = {
  ...rentOffice,
  listingType: "Sell",
  propertyType: "apartment",
  title: "2BHK Apartment",
  canonicalSlug: "2bhk-apartment-in-saibaba-colony-ap097",
};

describe("property breadcrumbs", () => {
  it("uses the listing type, not the availability status", () => {
    expect(isRentProperty(rentOffice)).toBe(true);
    const rentedOffice = { ...rentOffice, status: "rented" };
    const soldFlat = { ...saleFlat, status: "rented" };
    expect(isRentProperty(rentedOffice)).toBe(true);
    expect(isRentProperty(saleFlat)).toBe(false);
    expect(isRentProperty(soldFlat)).toBe(false);
  });

  it("links available rent listings to the rent hub", () => {
    const [transaction, type] = propertyBreadcrumbItems(rentOffice);
    expect(transaction.label).toBe("For Rent");
    expect(transaction.href).toBe("/commercial-spaces-for-rent-in-coimbatore");
    expect(type.href).toBe(transaction.href);
  });

  it("links sale listings to the sale hub", () => {
    const items = propertyBreadcrumbItems(saleFlat);
    expect(items[0]).toEqual({
      label: "For Sale",
      href: "/apartments-for-sale-in-coimbatore",
    });
    expect(items.at(-1)).toEqual({ label: "2BHK Apartment" });
  });

  it("applies the same rule on subpages", () => {
    const items = propertySectionBreadcrumbItems(rentOffice, "Office Space Photos");
    expect(items[0].label).toBe("For Rent");
    expect(items[0].href).toMatch(/^\/for-rent\//);
    expect(items[2].href).toBe("/" + rentOffice.canonicalSlug);
    expect(items[3]).toEqual({ label: "Office Space Photos" });
  });
});
