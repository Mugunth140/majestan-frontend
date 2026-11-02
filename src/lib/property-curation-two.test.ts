import { describe, expect, it } from "vitest";
import type { SeoProperty } from "./api/property-by-slug";
import {
  curationDetailRows,
  getBathroomCount,
  getCoworkingSeatRent,
} from "./property-curation-two";
import { getGroupedPropertyDetails } from "./property-detail-groups";
import { getLandPricePerUnit, getFarmlandSpecs } from "./property-sections";
function property(
  type: string,
  details: Record<string, unknown>,
  listingType = "Sell",
): SeoProperty {
  return {
    id: 7,
    title: "Synthetic",
    propertyType: type,
    listingType,
    price: "1000000",
    city: "Synthetic",
    details,
  } as unknown as SeoProperty;
}
describe("curation 2 website mappings", () => {
  it("shows the bathroom sum and its breakdown while retaining legacy totals", () => {
    expect(getBathroomCount({ bathrooms: 4 })).toBe(4);
    expect(
      getBathroomCount({
        bathrooms: 4,
        curationDetails: { individualBathrooms: null, attachedBathrooms: null },
      }),
    ).toBe(4);
    const p = property("apartment", {
      bathrooms: 9,
      curationDetails: { individualBathrooms: 2, attachedBathrooms: 1 },
    });
    expect(getBathroomCount(p.details)).toBe(3);
    expect(curationDetailRows(p)).toContainEqual(
      expect.objectContaining({
        label: "Bathroom Breakdown",
        value: "2 individual + 1 attached = 3 bathrooms",
      }),
    );
  });
  it("renders portion and parking combinations and omits private contact data", () => {
    const p = property("investment_property", {
      curationDetails: {
        portions: [
          { bhk: "3 BHK", count: 2 },
          { bhk: "2 BHK", count: 1 },
        ],
        parkingSpaces: [
          { vehicle: "Car", type: "Covered", count: 1 },
          { vehicle: "Bike", type: "Open", count: 2 },
        ],
        ownerPhone: "synthetic-private",
        totalRentPerMonth: 45000,
      },
    });
    const rows = curationDetailRows(p);
    expect(rows).toContainEqual(
      expect.objectContaining({
        label: "Portion Configurations",
        value: "3 BHK × 2, 2 BHK × 1",
      }),
    );
    expect(rows).toContainEqual(
      expect.objectContaining({
        label: "Parking Spaces",
        value: "Car Covered × 1, Bike Open × 2",
      }),
    );
    expect(JSON.stringify(rows)).not.toContain("synthetic-private");
  });
  it("replaces scalar uses with multi-select values and respects explicitly cleared lists", () => {
    const p = property(
      "commercial",
      {
        propertyUse: "Old use",
        specialPurpose: "Old purpose",
        utilitiesProvided: "Old utility",
        curationDetails: {
          propertyUses: ["Corporate Office", "Retail Showroom"],
          specialPurposes: ["Gym / Fitness Center"],
          utilities: ["Power Backup"],
        },
      },
      "Rent",
    );
    const rows = getGroupedPropertyDetails(p).flatMap((g) => g.fields);
    expect(rows.filter((f) => f.label === "Property Use")).toEqual([
      expect.objectContaining({ value: "Corporate Office, Retail Showroom" }),
    ]);
    const cleared = property(
      "commercial",
      {
        ...p.details,
        curationDetails: {
          propertyUses: [],
          specialPurposes: [],
          utilities: [],
        },
      },
      "Rent",
    );
    const groups = getGroupedPropertyDetails(cleared);
    expect(groups.every((g) => g.fields.length > 0)).toBe(true);
    expect(JSON.stringify(groups)).not.toMatch(
      /Old use|Old purpose|Old utility/,
    );
  });
  it("honors land area and rate units without losing the canonical sqft basis", () => {
    const d = {
      areaSqft: "43560",
      areaUnit: "Sq Ft",
      measurementUnits: { landArea: "Acres", pricePerSqft: "Acres" },
    };
    expect(getLandPricePerUnit("4356000", d, "farmland")).toBe(
      "₹ 43,56,000/acre",
    );
    expect(getFarmlandSpecs(d)).toContainEqual(
      expect.objectContaining({ label: "Farm Area", value: "1 acres" }),
    );
    expect(
      getLandPricePerUnit(
        "4356000",
        { ...d, areaSqft: "0", plotSizeCents: "100" },
        "farmland",
      ),
    ).toBeNull();
  });
  it("projects only the current type's facilities and hides unchecked restroom counts", () => {
    const d = {
      hasRestroom: false,
      curationDetails: {
        restroomCount: 3,
        hasFreeRefreshment: false,
        hasCanteen: true,
        powerSupplyCapacity: "High Density",
      },
    };
    const rows = curationDetailRows(property("coworking", d, "Rent"));
    expect(rows).toContainEqual(
      expect.objectContaining({ label: "Free Refreshment", value: "No" }),
    );
    expect(rows.some((r) => r.label === "No of Rest Rooms")).toBe(false);
    expect(rows.some((r) => r.label === "Canteen")).toBe(false);
    expect(curationDetailRows(property("industrial", d))).toContainEqual(
      expect.objectContaining({ label: "Power Supply", value: "High Density" }),
    );
  });
  it("uses a known per-seat rate without treating old monthly totals as seat prices", () => {
    expect(getCoworkingSeatRent({ rentPerSeat: "8000" })).toBe(8000);
    expect(getCoworkingSeatRent({})).toBeNull();
    expect(getCoworkingSeatRent({ rentPerSeat: 0 })).toBeNull();
  });
});

it.each([ ["apartment", "Sell"], ["apartment", "Rent"], ["villa", "Sell"], ["villa", "Rent"] ])("displays the parking breakdown instead of stale scalar parking for %s %s", (type, listing) => {
  const details = { parking: 9, parkingType: "Covered", curationDetails: { parkingSpaces: [
    { vehicle: "Car", type: "Open", count: 1 }, { vehicle: "Bike", type: "Covered", count: 2 },
  ] } };
  const fields = getGroupedPropertyDetails(property(type, details, listing)).flatMap(group => group.fields);
  expect(fields).toContainEqual(expect.objectContaining({ label: "Parking Spaces", value: "Car Open × 1, Bike Covered × 2" }));
  expect(fields.some(field => field.label === "Parking Type" || field.value === "9 Covered")).toBe(false);
  const noParking = getGroupedPropertyDetails(property(type, { ...details, curationDetails: { parkingSpaces: [] } }, listing)).flatMap(group => group.fields);
  expect(noParking).toContainEqual(expect.objectContaining({ label: "Parking Spaces", value: "No parking" }));
  const legacy = getGroupedPropertyDetails(property(type, { parking: 3, parkingType: "Covered" }, listing)).flatMap(group => group.fields);
  expect(legacy).toContainEqual(expect.objectContaining({ label: "Parking Type", value: "Covered" }));
});
