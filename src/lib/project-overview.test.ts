import { describe, expect, it } from "vitest";
import {
  buildDetailRows,
  buildFacts,
  formatPossession,
  rateFact,
  unitAreaCell,
} from "./project-overview";
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

describe("the fact rail and the spec sheet never carry the same fact", () => {
  // This is the whole point of splitting the two builders. The page this
  // replaced rendered BHK, area, possession, RERA, developer and project id
  // two or three times each, across a stats grid, a sidebar grid and a
  // sidebar footer.
  const cases: [string, ProjectDetail][] = [
    [
      "apartment",
      project({
        towers: 4,
        totalFloors: 15,
        totalUnits: 240,
        projectAreaSqft: "87120",
        reraNumber: "TN/01/BUILDING/0123/2026",
        builderName: "Shriram Properties",
      }),
    ],
    [
      "plot",
      project({
        projectType: "plot",
        units: [
          unit({ bedrooms: null, superBuiltupAreaSqft: null, plotAreaCents: "4", price: "9000000" }),
        ],
        ranges: {
          ...project().ranges,
          bhk: [],
          minPlotCents: 4,
          maxPlotCents: 4,
          plotCents: [4],
          plotDimensions: ["40 x 60 ft"],
          plotBoundaryWall: true,
          plotOpenSides: [1, 3],
        },
      }),
    ],
  ];

  it.each(cases)("holds for a %s project", (_label, fixture) => {
    const factLabels = buildFacts(fixture).map((f) => f.label.toLowerCase());
    const rowLabels = buildDetailRows(fixture).map((r) => r.label.toLowerCase());
    const overlap = factLabels.filter((label) => rowLabels.includes(label));
    expect(overlap).toEqual([]);
  });

  it.each(cases)("keeps price, size and possession out of the spec sheet (%s)", (_l, fixture) => {
    const rowLabels = buildDetailRows(fixture).map((r) => r.label.toLowerCase());
    for (const banned of ["price", "plot price", "possession", "saleable area", "configurations"]) {
      expect(rowLabels).not.toContain(banned);
    }
  });
});

describe("rateFact", () => {
  it("derives the rate per unit rather than dividing the lowest price by the smallest area", () => {
    // 90L over 1400 sq.ft is ~6,429; 6Cr over 1800 is ~33,333. Dividing the
    // range endpoints instead would report 9000000/1800 = 5,000 — a rate no
    // unit in this project is actually sold at.
    const fixture = project({
      units: [
        unit({ id: 1, price: "9000000", superBuiltupAreaSqft: "1400" }),
        unit({ id: 2, price: "60000000", superBuiltupAreaSqft: "1800" }),
      ],
    });
    expect(rateFact(fixture)).toEqual({
      label: "Rate per sq.ft",
      value: "₹6,429",
      note: "onwards",
    });
  });

  it("prices plots per cent", () => {
    const fixture = project({
      projectType: "plot",
      units: [unit({ bedrooms: null, superBuiltupAreaSqft: null, plotAreaCents: "4", price: "9000000" })],
    });
    expect(rateFact(fixture)?.label).toBe("Rate per cent");
    expect(rateFact(fixture)?.value).toBe("₹22,50,000");
    // One unit means one rate, so there is nothing for "onwards" to qualify.
    expect(rateFact(fixture)?.note).toBeUndefined();
  });

  it("returns null when no unit has both a price and a size", () => {
    expect(rateFact(project({ units: [unit({ price: null })] }))).toBeNull();
    expect(rateFact(project({ units: [] }))).toBeNull();
  });

  it("ignores sold units while any unit is still available", () => {
    const fixture = project({
      units: [
        unit({ id: 1, price: "1000000", superBuiltupAreaSqft: "1000", status: "sold" }),
        unit({ id: 2, price: "9000000", superBuiltupAreaSqft: "1500", status: "available" }),
      ],
    });
    expect(rateFact(fixture)?.value).toBe("₹6,000");
  });
});

describe("buildDetailRows", () => {
  it("reads open sides as alternatives, not as one plot with three of them", () => {
    const fixture = project({
      projectType: "plot",
      ranges: { ...project().ranges, bhk: [], plotOpenSides: [1, 3] },
    });
    const row = buildDetailRows(fixture).find((r) => r.label === "Open sides");
    expect(row?.value).toBe("1 or 3");
  });

  it("converts a project area over an acre into acres", () => {
    const rows = buildDetailRows(project({ projectAreaSqft: "87120" }));
    expect(rows.find((r) => r.label === "Project area")?.value).toBe("2 acres");
  });

  it("keeps sub-acre sites in square feet", () => {
    const rows = buildDetailRows(project({ projectAreaSqft: "17424" }));
    expect(rows.find((r) => r.label === "Project area")?.value).toBe("17,424 sq.ft");
  });

  it("omits rows the project has no value for", () => {
    const labels = buildDetailRows(project()).map((r) => r.label);
    expect(labels).not.toContain("Towers");
    expect(labels).not.toContain("Total units");
    expect(labels).not.toContain("RERA number");
  });
});

describe("buildFacts", () => {
  it("qualifies a price range with the number of units it spans", () => {
    const fixture = project({
      units: [unit({ id: 1 }), unit({ id: 2, price: "9000000" })],
      ranges: { ...project().ranges, minPrice: 6000000, maxPrice: 9000000 },
    });
    const price = buildFacts(fixture)[0];
    expect(price.value).toBe("₹60.00 L – ₹90.00 L");
    expect(price.note).toBe("across 2 units");
  });

  it("falls back to the possession status when no date is set", () => {
    const facts = buildFacts(project({ possessionDate: null }));
    const possession = facts.find((f) => f.label === "Possession");
    expect(possession?.value).toBe("Under Construction");
    expect(possession?.note).toBeUndefined();
  });
});

describe("formatPossession", () => {
  it("reports a month, which is the honest precision for a handover date", () => {
    expect(formatPossession("2027-06-30")).toBe("Jun 2027");
  });

  it("passes through anything it cannot parse instead of printing NaN", () => {
    expect(formatPossession("Q3 2027")).toBe("Q3 2027");
    expect(formatPossession(null)).toBeNull();
    expect(formatPossession("  ")).toBeNull();
  });
});

describe("unitAreaCell", () => {
  it("gives plots both units, because listings quote either", () => {
    expect(unitAreaCell(unit({ plotAreaCents: "4" }), "plot")).toBe("4 cents (1,742 sq.ft)");
  });

  it("renders a dash rather than NaN when a plot has no recorded area", () => {
    expect(unitAreaCell(unit({ plotAreaCents: null }), "plot")).toBe("—");
  });
});
