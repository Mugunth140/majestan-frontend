import { describe, expect, it } from "vitest";
import {
  buildPayload,
  areaToSqft,
  convertAreaAmount,
  CATEGORIES,
  cleanDraft,
  emptyDraft,
  restoreDraft,
  validateStep,
  visibleFields,
} from "./owner-post-model";

const base = () => ({
  ...emptyDraft(),
  category: "apartment" as const,
  cityId: "1",
  sublocationId: "2",
  values: {
    title: "A bright apartment",
    description: "A home near the park",
    address: "Example street",
    price: "5000000",
    areaSqft: "1200",
    bedrooms: "3",
    bathrooms: "2",
  },
});
describe("owner posting branches and payloads", () => {
  it("converts land units without changing the represented area", () => {
    expect(areaToSqft(1, "Grounds")).toBe(2400);
    expect(areaToSqft(100, "Cents")).toBe(43560);
    expect(areaToSqft(1, "Acres")).toBe(43560);

    const inCents = convertAreaAmount("1", "Acres", "Cents");
    expect(Number(inCents)).toBeCloseTo(100, 8);
    expect(areaToSqft(Number(inCents), "Cents")).toBeCloseTo(43560, 7);
    const inSqft = convertAreaAmount("1", "Sq Ft", "Cents");
    expect(areaToSqft(Number(inSqft), "Cents")).toBeCloseTo(1, 7);
  });
  it.each([
    ["Sq Ft", "1200", 1200],
    ["Cents", "10", 4356],
    ["Acres", "1", 43560],
    ["Grounds", "1", 2400],
  ])("stores %s input as canonical square feet", (unit, amount, sqft) => {
    const payload = buildPayload({
      ...base(),
      category: "plot",
      values: { ...base().values, areaSqft: amount, areaUnit: unit },
    });

    expect(payload.details).toMatchObject({
      areaSqft: sqft,
      plotArea: Number(amount),
      areaUnit: unit,
      plotSizeCents: Number((Number(sqft) / 435.6).toFixed(10)),
    });
  });
  it("treats missing legacy draft units as square feet and keeps one area input", () => {
    const draft = cleanDraft({
      ...base(),
      category: "farmland",
      values: { ...base().values, areaSqft: "2400", plotSizeCents: "0.5" },
    });

    expect(draft.values.areaUnit).toBeUndefined();
    expect(visibleFields(draft, 2).some((field) => field.key === "plotSizeCents")).toBe(false);
    expect(buildPayload(draft).details).toMatchObject({
      areaSqft: 2400,
      plotArea: 2400,
      areaUnit: "Sq Ft",
      plotSizeCents: Number((2400 / 435.6).toFixed(10)),
    });
  });
  it("validates the selected amount against the canonical land-area range", () => {
    const tooSmall = {
      ...base(),
      category: "plot" as const,
      values: { ...base().values, areaSqft: "0.0001", areaUnit: "Sq Ft" },
    };
    const validGround = {
      ...base(),
      category: "plot" as const,
      values: { ...base().values, areaSqft: "0.0005", areaUnit: "Acres" },
    };

    expect(validateStep(tooSmall, 2)).toHaveProperty("areaSqft");
    expect(validateStep(validGround, 2)).not.toHaveProperty("areaSqft");
  });
  it("switches sale to rental without leaking sale fields", () => {
    const draft = {
      ...base(),
      listingType: "Rent" as const,
      values: {
        ...base().values,
        bookingAmount: "50000",
        reraNumber: "old-registration",
        ownershipType: "Freehold",
        securityDeposit: "90000",
        availableFrom: "2026-12-01",
      },
    };
    const payload = buildPayload(draft);
    expect(payload).toMatchObject({
      listingType: "Rent",
      securityDeposit: "90000",
      availableFrom: "2026-12-01",
    });
    expect(payload).not.toHaveProperty("bookingAmount");
    expect(payload).not.toHaveProperty("reraNumber");
    expect(payload).not.toHaveProperty("ownershipType");
    expect(visibleFields(draft, 3).find((f) => f.key === "price")?.label).toBe(
      "Monthly rent (₹)",
    );
  });
  it("switches from a furnished apartment to land without room or furnishing data", () => {
    const draft = cleanDraft({
      ...base(),
      category: "plot",
      values: {
        ...base().values,
        furnishingStatus: "FULLY FURNISHED",
        floorNumber: "3",
        plotLength: "40",
      },
      amenityIds: [1],
      furnishingIds: [2],
    });
    expect(draft.values).not.toHaveProperty("bedrooms");
    expect(draft.values).not.toHaveProperty("floorNumber");
    expect(draft.amenityIds).toEqual([]);
    expect(draft.furnishingIds).toEqual([]);
    expect(buildPayload(draft)).toMatchObject({
      details: { areaSqft: 1200, plotLength: 40 },
      location: { address: "Example street" },
    });
  });
  it("excludes farmland from rental and conditional parking/furnishing values", () => {
    expect(
      cleanDraft({ ...emptyDraft(), category: "farmland", listingType: "Rent" })
        .category,
    ).toBe("");
    const d = cleanDraft({
      ...base(),
      furnishingIds: [1],
      values: {
        ...base().values,
        parking: "0",
        parkingType: "Covered",
        furnishingStatus: "UNFURNISHED",
      },
    });
    expect(d.values.parkingType).toBeUndefined();
    expect(d.furnishingIds).toEqual([]);
  });
  it.each(CATEGORIES)(
    "has valid category-specific fields for $label",
    ({ value }) => {
      const d = {
        ...base(),
        category: value,
        values: { ...base().values, availableWorkstations: "10" },
      };
      expect(validateStep(d, 2)).toEqual({});
      expect(buildPayload(d).details.areaSqft).toBe(1200);
    },
  );
  it("validates required locality, invalid numbers and inconsistent measurements", () => {
    expect(validateStep({ ...base(), sublocationId: "" }, 1)).toHaveProperty(
      "sublocationId",
    );
    expect(
      validateStep(
        {
          ...base(),
          values: {
            ...base().values,
            bedrooms: "1.5",
            areaSqft: "-20",
            carpetArea: "1500",
          },
        },
        2,
      ),
    ).toMatchObject({
      bedrooms: expect.any(String),
      areaSqft: expect.any(String),
      carpetArea: expect.any(String),
    });
    expect(
      validateStep(
        { ...base(), values: { ...base().values, price: "NaN" } },
        3,
      ),
    ).toHaveProperty("price");
  });
  it("restores an earlier partial draft but removes staff and inactive fields", () => {
    const d = restoreDraft({
      category: "plot",
      title: "Legacy plot",
      cityId: 3,
      details: { areaSqft: 400, bedrooms: 2 },
      status: "sold",
    });
    expect(d?.values).toMatchObject({ title: "Legacy plot", areaSqft: "400" });
    expect(d?.values.bedrooms).toBeUndefined();
    expect(restoreDraft(null)).toBeNull();
  });
});
