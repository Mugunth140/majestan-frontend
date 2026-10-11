import { describe, expect, it } from "vitest";
import { summarizeConfigurations, unitAreaLabel } from "./project-config-summary";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";

function unit(overrides: Partial<ProjectUnit> = {}): ProjectUnit {
  return {
    id: 1,
    unitCode: "U1",
    title: null,
    unitType: "apartment_unit",
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    carpetAreaSqft: null,
    builtupAreaSqft: null,
    superBuiltupAreaSqft: "1200",
    furnishedStatus: null,
    facing: null,
    price: "6000000",
    status: "available",
    floorPlanImageUrl: null,
    isPrimary: true,
    ...overrides,
  };
}

function project(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    id: 1,
    projectCode: "PA0001",
    name: "Emerald Heights",
    slug: "emerald-heights",
    canonicalSlug: "emerald-heights-pa0001",
    projectType: "apartment",
    builderName: null,
    reraNumber: null,
    possessionDate: "2027-06-30",
    possessionStatus: "under_construction",
    city: "Coimbatore",
    state: "Tamil Nadu",
    sublocation: "Saravanampatti",
    address: null,
    towers: null,
    totalUnits: null,
    description: null,
    coverImageUrl: null,
    galleryImageUrls: null,
    status: "published",
    seo: null,
    units: [unit()],
    ranges: {
      minPrice: 6000000,
      maxPrice: 6000000,
      minArea: 1200,
      maxArea: 1200,
      minPlotCents: null,
      maxPlotCents: null,
      plotCents: [],
      bhk: [2],
      facings: [],
      unitsCount: 1,
      plotDimensions: [],
      plotBoundaryWall: false,
      plotOpenSides: [],
    },
    ...overrides,
  };
}

describe("summarizeConfigurations", () => {
  it("returns nothing for a project without units", () => {
    expect(summarizeConfigurations(project({ units: [] }))).toEqual([]);
  });

  it("writes one summary per configuration, in group order", () => {
    const summaries = summarizeConfigurations(
      project({
        units: [
          unit({ id: 1, bedrooms: 3 }),
          unit({ id: 2, bedrooms: 1 }),
          unit({ id: 3, bedrooms: 2 }),
        ],
      }),
    );
    expect(summaries.map((s) => s.key)).toEqual(["bhk-1", "bhk-2", "bhk-3"]);
    expect(summaries.map((s) => s.label)).toEqual(["1 BHK", "2 BHK", "3 BHK"]);
    expect(summaries[0].typeLabel).toBe("Apartment");
  });

  it("labels the area with the first measure any unit in the group has", () => {
    // Only one flat quotes super built-up. The range is across that flat alone,
    // because the other has nothing to compare on that measure.
    const [summary] = summarizeConfigurations(
      project({
        units: [
          unit({ id: 1, superBuiltupAreaSqft: "1400", builtupAreaSqft: "1100" }),
          unit({ id: 2, superBuiltupAreaSqft: null, builtupAreaSqft: "1300" }),
        ],
      }),
    );
    expect(summary.areaLabel).toBe("Super built-up area");
    expect(summary.areaValue).toBe("1,400 sq.ft");
  });

  it("falls back to built-up, then carpet, when no unit in the group has super built-up", () => {
    const [builtup] = summarizeConfigurations(
      project({
        units: [
          unit({ id: 1, superBuiltupAreaSqft: null, builtupAreaSqft: "1100" }),
          unit({ id: 2, superBuiltupAreaSqft: null, builtupAreaSqft: "1300" }),
        ],
      }),
    );
    expect(builtup.areaLabel).toBe("Built-up area");
    expect(builtup.areaValue).toBe("1,100 – 1,300 sq.ft");

    const [carpet] = summarizeConfigurations(
      project({
        units: [unit({ superBuiltupAreaSqft: null, carpetAreaSqft: "950" })],
      }),
    );
    expect(carpet.areaLabel).toBe("Carpet area");
    expect(carpet.areaValue).toBe("950 sq.ft");
  });

  it("hides the area block when no unit in the group has any measure", () => {
    const [summary] = summarizeConfigurations(
      project({
        units: [
          unit({ superBuiltupAreaSqft: null, builtupAreaSqft: null, carpetAreaSqft: null }),
        ],
      }),
    );
    expect(summary.areaLabel).toBeNull();
    expect(summary.areaValue).toBeNull();
    expect(summary.areaSecondary).toBeNull();
  });

  it("converts square feet to square metres to two decimals, with Indian digit grouping", () => {
    const [flat] = summarizeConfigurations(project({ units: [unit({ superBuiltupAreaSqft: "1000" })] }));
    expect(flat.areaSecondary).toBe("(92.90 sqm)");

    const [large] = summarizeConfigurations(
      project({ units: [unit({ superBuiltupAreaSqft: "100000" })] }),
    );
    expect(large.areaValue).toBe("1,00,000 sq.ft");
    expect(large.areaSecondary).toBe("(9,290.30 sqm)");
  });

  it("shows a plot in cents, with its square feet in brackets and no square metres", () => {
    const [plot] = summarizeConfigurations(
      project({
        projectType: "plot",
        units: [unit({ bedrooms: null, superBuiltupAreaSqft: null, plotAreaCents: "4" })],
      }),
    );
    expect(plot.label).toBe("4 cents");
    expect(plot.typeLabel).toBe("Plot");
    expect(plot.areaLabel).toBe("Plot area");
    expect(plot.areaValue).toBe("4 cents");
    expect(plot.areaSecondary).toBe("(1,742 sq.ft)");
  });

  it("prices a group as one range across its units", () => {
    const [summary] = summarizeConfigurations(
      project({
        units: [unit({ id: 1, price: "9000000" }), unit({ id: 2, price: "12000000" })],
      }),
    );
    expect(summary.priceLabel).toBe("₹90 L – ₹1.2 Cr");
  });

  it("prices from available units only when any are available", () => {
    const [summary] = summarizeConfigurations(
      project({
        units: [
          unit({ id: 1, price: "6000000", status: "available" }),
          unit({ id: 2, price: "9000000", status: "sold" }),
        ],
      }),
    );
    expect(summary.priceLabel).toBe("₹60 L");
    expect(summary.availableCount).toBe(1);
  });

  it("prices a sold-out group from all its units, and counts it as sold out", () => {
    const [summary] = summarizeConfigurations(
      project({
        units: [
          unit({ id: 1, price: "6000000", status: "sold" }),
          unit({ id: 2, price: "7000000", status: "booked" }),
        ],
      }),
    );
    expect(summary.priceLabel).toBe("₹60 – 70 L");
    expect(summary.availableCount).toBe(0);
  });

  it("says price on request when no unit in the group is priced", () => {
    const [summary] = summarizeConfigurations(project({ units: [unit({ price: null })] }));
    expect(summary.priceLabel).toBe("Price on request");
  });

  it("counts only the units still on sale in each group", () => {
    const [summary] = summarizeConfigurations(
      project({
        units: [
          unit({ id: 1, status: "available" }),
          unit({ id: 2, status: "available" }),
          unit({ id: 3, status: "reserved" }),
        ],
      }),
    );
    expect(summary.availableCount).toBe(2);
  });
});

describe("unitAreaLabel", () => {
  it("quotes the widest area a flat has, in sq.ft", () => {
    expect(unitAreaLabel(unit({ superBuiltupAreaSqft: "1450" }), "apartment")).toBe("1,450 sq.ft");
  });

  it("quotes a plot in cents", () => {
    expect(unitAreaLabel(unit({ bedrooms: null, plotAreaCents: "4.0000" }), "plot")).toBe("4 cents");
  });

  it("returns null when the unit has no area", () => {
    expect(
      unitAreaLabel(
        unit({ superBuiltupAreaSqft: null, builtupAreaSqft: null, carpetAreaSqft: null }),
        "apartment",
      ),
    ).toBeNull();
  });
});
