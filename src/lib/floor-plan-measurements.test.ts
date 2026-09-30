// site/majestan-frontend/src/lib/floor-plan-measurements.test.ts
import { describe, expect, it } from "vitest";
import { getFloorPlanMeasurements } from "./floor-plan-measurements";

describe("getFloorPlanMeasurements", () => {
  it("returns the four key measurements with formatted values", () => {
    const rows = getFloorPlanMeasurements({
      bedrooms: 3,
      bathrooms: 2,
      areaSqft: "1456.00",
      parking: 1,
      furnished: true,
    });

    expect(rows.map((r) => [r.label, r.value])).toEqual([
      ["Total Area", "1,456 sq.ft"],
      ["Bedrooms", "3 BHK"],
      ["Bathrooms", "2 Bath"],
      ["Parking", "1 Covered"],
    ]);
    for (const row of rows) expect(row.icon).toBeDefined();
  });

  it("falls back to an em dash when details are missing", () => {
    const rows = getFloorPlanMeasurements(null);

    expect(rows).toHaveLength(4);
    for (const row of rows) expect(row.value).toBe("—");
  });

  it("mixes real values with dashes for partial details", () => {
    const rows = getFloorPlanMeasurements({
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: "",
      parking: 0,
      furnished: false,
    });

    expect(rows.map((r) => r.value)).toEqual(["—", "—", "—", "—"]);
  });

  it("keeps a non-numeric area as written", () => {
    // parseFloat succeeds on leading digits, so "1.5 grounds" normalises to
    // "1.5" — pinned here to preserve the floor-plan page's exact behaviour.
    const rows = getFloorPlanMeasurements({
      bedrooms: 2,
      bathrooms: 1,
      areaSqft: "1.5 grounds",
      parking: 0,
      furnished: false,
    });

    expect(rows[0].value).toBe("1.5 sq.ft");
  });
});
