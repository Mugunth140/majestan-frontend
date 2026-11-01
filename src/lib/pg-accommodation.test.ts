import { expect, it } from "vitest";
import { pgReadFields, pgRentBasis } from "./pg-accommodation";
import { curationDetailRows } from "./property-curation-two";
import type { SeoProperty } from "./api/property-by-slug";
it("uses explicit room type for rent labels and leaves older records unclassified", () => {
  expect(pgRentBasis({ roomType: "Sharing" })).toBe("bed");
  expect(pgRentBasis({ roomType: "Private" })).toBe("room");
  expect(pgRentBasis(null)).toBeNull();
});
it("displays capacity, false facilities, meal schedules and included services", () => {
  const rows = pgReadFields({
    roomType: "Sharing",
    totalCapacity: 8,
    availableCapacity: 0,
    attachedBathroom: false,
    foodAvailable: "Available",
    weekdayMeals: ["Breakfast", "Dinner"],
    services: [{ name: "Wifi", status: "Included in rent" }],
  });
  expect(rows).toContainEqual({ label: "Beds available in PG", value: "0" });
  expect(rows).toContainEqual({ label: "Attached bathroom", value: "No" });
  expect(rows).toContainEqual({
    label: "Meals on weekdays",
    value: "Breakfast, Dinner",
  });
  expect(rows).toContainEqual({ label: "Wifi", value: "Included in rent" });
});
it("hides dormant meal charges when food is unavailable", () => {
  const rows = pgReadFields({
    foodAvailable: "Not Available",
    foodChargeType: "Fixed monthly amount",
    foodMonthlyCharge: 2500,
    weekdayMeals: ["Lunch"],
  });
  expect(
    rows.some((row) =>
      ["Monthly food charge", "Meals on weekdays"].includes(row.label),
    ),
  ).toBe(false);
});
it("scopes the new facts to PG listings and hides furnishings for unfurnished rooms", () => {
  const details = {
    furnishingStatus: "UNFURNISHED",
    curationDetails: {
      pgDetails: {
        roomType: "Private",
        roomFurnishings: [{ item: "Beds", count: 2 }],
      },
    },
  };
  const property = {
    propertyType: "pg_service_apartment",
    listingType: "Rent",
    details,
  } as unknown as SeoProperty;
  expect(curationDetailRows(property)).toContainEqual(
    expect.objectContaining({ label: "Room type", value: "Private" }),
  );
  expect(
    curationDetailRows(property).some(
      (row) => row.label === "In room furnishings",
    ),
  ).toBe(false);
  expect(
    curationDetailRows({ ...property, propertyType: "commercial" }),
  ).not.toContainEqual(expect.objectContaining({ label: "Room type" }));
});

it("builds researched PG detail groups without stale apartment inventory or area rates", async () => {
  const { getGroupedPropertyDetails } =
    await import("./property-detail-groups");
  const property = {
    propertyType: "pg_service_apartment",
    listingType: "Rent",
    price: "8000",
    details: {
      builtUpArea: "1000",
      numberOfFlats: 50,
      towerNos: 2,
      udsArea: "300",
      curationDetails: {
        pgDetails: {
          roomType: "Sharing",
          category: "Serviced Apartment",
          depositType: "None",
          availableCapacity: 3,
        },
      },
    },
  } as unknown as SeoProperty;
  const groups = getGroupedPropertyDetails(property, {
    pricePerSqft: "₹ 8/sqft",
  });
  const rows = groups.flatMap((group) => group.fields);
  expect(rows).toContainEqual(
    expect.objectContaining({
      label: "Monthly rent",
      value: expect.stringContaining("/ bed / month"),
    }),
  );
  expect(rows).toContainEqual(
    expect.objectContaining({ label: "Built-Up Area", value: "1,000 sq.ft" }),
  );
  expect(
    rows.some((row) =>
      [
        "Total Flats in Project",
        "Total Towers",
        "Undivided Share of Land (UDS)",
        "Price per Sq. Ft.",
        "Approvals",
      ].includes(row.label),
    ),
  ).toBe(false);
});

it('shows legacy Furnished room items while continuing to hide Unfurnished items',()=>{
 const property={propertyType:'pg_service_apartment',listingType:'Rent',details:{furnishingStatus:'Furnished',curationDetails:{pgDetails:{roomType:'Private',roomFurnishings:[{item:'Beds',count:2}]}}}} as unknown as SeoProperty;
 expect(curationDetailRows(property)).toContainEqual({label:'In room furnishings',value:'Beds × 2'});
});
