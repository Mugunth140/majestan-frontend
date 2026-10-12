import { projectCoordinates } from "./project-overview";
import { describe, expect, it } from "vitest";
import {
  buildDetailRows,
  possessionLabel,
  buildFacts,
  formatPossession,
  groupUnitsByConfiguration,
  rateFact,
  unitAreaCell,
  unitRateLabel,
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
    for (const banned of ["price", "plot price", "possession", "built-up area", "configurations"]) {
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
  it("prices the range with no unit-count note", () => {
    const fixture = project({
      units: [unit({ id: 1 }), unit({ id: 2, price: "9000000" })],
      ranges: { ...project().ranges, minPrice: 6000000, maxPrice: 9000000 },
    });
    const price = buildFacts(fixture)[0];
    expect(price.value).toBe("₹60 L – 90 L");
    expect(price.note).toBeUndefined();
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

describe("groupUnitsByConfiguration", () => {
  it("groups flats by bedroom count and orders the groups ascending", () => {
    const fixture = project({
      units: [
        unit({ id: 1, bedrooms: 3 }),
        unit({ id: 2, bedrooms: 1 }),
        unit({ id: 3, bedrooms: 2 }),
        unit({ id: 4, bedrooms: 2 }),
      ],
    });
    const groups = groupUnitsByConfiguration(fixture);
    expect(groups.map((g) => g.label)).toEqual(["1 BHK", "2 BHK", "3 BHK"]);
    expect(groups.map((g) => g.key)).toEqual(["bhk-1", "bhk-2", "bhk-3"]);
    expect(groups[1].units.map((u) => u.id)).toEqual([3, 4]);
  });

  it("groups plots by land area rounded to two decimals, ascending, with unsized plots last", () => {
    const fixture = project({
      projectType: "plot",
      units: [
        unit({ id: 1, bedrooms: null, plotAreaCents: "4.0000" }),
        unit({ id: 2, bedrooms: null, plotAreaCents: "2.5" }),
        unit({ id: 3, bedrooms: null, plotAreaCents: "4.004" }),
        unit({ id: 4, bedrooms: null, plotAreaCents: null }),
      ],
    });
    const groups = groupUnitsByConfiguration(fixture);
    expect(groups.map((g) => g.label)).toEqual(["2.5 cents", "4 cents", "Plot"]);
    expect(groups.map((g) => g.key)).toEqual(["cents-2.5", "cents-4", "plot"]);
    // 4.0000 and 4.004 both round to 4.00 cents, so they sell as one configuration.
    expect(groups[1].units.map((u) => u.id)).toEqual([1, 3]);
  });

  it("falls back to the unit title, then the unit type, for units with no bedroom count", () => {
    const fixture = project({
      units: [
        unit({ id: 1, bedrooms: 2 }),
        unit({ id: 2, bedrooms: null, title: "  Penthouse  ", unitType: "apartment_unit" }),
        unit({ id: 3, bedrooms: null, title: null, unitType: "villa_unit" }),
      ],
    });
    const groups = groupUnitsByConfiguration(fixture);
    // Numeric groups lead; named groups follow alphabetically.
    expect(groups.map((g) => g.label)).toEqual(["2 BHK", "Penthouse", "Villa Unit"]);
    expect(groups[1].key).toBe("other-penthouse");
    expect(groups[2].key).toBe("other-villa_unit");
  });

  it("lists available units before sold ones within a group, keeping stored order otherwise", () => {
    const fixture = project({
      units: [
        unit({ id: 1, bedrooms: 2, status: "sold" }),
        unit({ id: 2, bedrooms: 2, status: "available" }),
        unit({ id: 3, bedrooms: 2, status: "booked" }),
        unit({ id: 4, bedrooms: 2, status: "available" }),
      ],
    });
    const [group] = groupUnitsByConfiguration(fixture);
    expect(group.units.map((u) => u.id)).toEqual([2, 4, 1, 3]);
  });

  it("takes the lowest positive price as the group's minimum, ignoring null and zero", () => {
    const fixture = project({
      units: [
        unit({ id: 1, bedrooms: 2, price: null }),
        unit({ id: 2, bedrooms: 2, price: "0" }),
        unit({ id: 3, bedrooms: 2, price: "7500000" }),
        unit({ id: 4, bedrooms: 2, price: "6000000.00" }),
      ],
    });
    expect(groupUnitsByConfiguration(fixture)[0].minPrice).toBe(6000000);
  });

  it("reports a null minimum when no unit in the group is priced", () => {
    const fixture = project({ units: [unit({ bedrooms: 2, price: null })] });
    expect(groupUnitsByConfiguration(fixture)[0].minPrice).toBeNull();
  });

  it("returns no groups for a project with no units", () => {
    expect(groupUnitsByConfiguration(project({ units: [] }))).toEqual([]);
  });
});

describe("unitRateLabel", () => {
  it("prices a flat per sq.ft, rounded to the rupee", () => {
    expect(
      unitRateLabel(unit({ superBuiltupAreaSqft: "1450", price: "6000000" }), "apartment"),
    ).toBe("₹4,138 / sq.ft");
  });

  it("prices a plot per cent in Indian digit grouping", () => {
    expect(
      unitRateLabel(unit({ bedrooms: null, plotAreaCents: "4.0000", price: "9000000" }), "plot"),
    ).toBe("₹22,50,000 / cent");
  });

  it("returns null when the unit has no price", () => {
    expect(unitRateLabel(unit({ price: null }), "apartment")).toBeNull();
    expect(unitRateLabel(unit({ price: "0" }), "apartment")).toBeNull();
  });

  it("returns null when the unit has no area to divide by", () => {
    expect(
      unitRateLabel(
        unit({ superBuiltupAreaSqft: null, builtupAreaSqft: null, carpetAreaSqft: null }),
        "apartment",
      ),
    ).toBeNull();
    expect(unitRateLabel(unit({ bedrooms: null, plotAreaCents: null }), "plot")).toBeNull();
  });
});

describe("range labels", () => {
  it("writes the unit once, after the range", () => {
    const fixture = project({
      units: [
        unit({ id: 1, superBuiltupAreaSqft: "1400" }),
        unit({ id: 2, superBuiltupAreaSqft: "1800" }),
      ],
    });
    expect(buildFacts(fixture).find((f) => f.label === "Built-up area")?.value).toBe(
      "1,400 – 1,800 sq.ft",
    );
  });

  it("keeps the unit on a single value", () => {
    expect(buildFacts(project()).find((f) => f.label === "Built-up area")?.value).toBe(
      "1,200 sq.ft",
    );
  });
});

describe("fact rail", () => {
  it("leaves the rate to the enquiry card", () => {
    const labels = buildFacts(project()).map((f) => f.label);
    expect(labels).not.toContain("Rate per sq.ft");
    expect(labels).not.toContain("Rate per cent");
  });

  it("quotes built-up area, falling back per unit when it is missing", () => {
    const fixture = project({
      units: [
        unit({ id: 1, superBuiltupAreaSqft: "1450", builtupAreaSqft: "1200", carpetAreaSqft: "1000" }),
        unit({ id: 2, superBuiltupAreaSqft: null, carpetAreaSqft: "1800" }),
      ],
    });
    expect(buildFacts(fixture).find((f) => f.label === "Built-up area")?.value).toBe(
      "1,200 – 1,800 sq.ft",
    );
  });
});

describe("possession", () => {
  it("names the three CRM states exactly", () => {
    expect(possessionLabel("new_launch")).toBe("New Launch");
    expect(possessionLabel("under_construction")).toBe("Under Construction");
    expect(possessionLabel("ready_to_move")).toBe("Ready to Move");
  });

  it("shows only the status in the rail, never the date", () => {
    const fact = buildFacts(project({ possessionDate: "2027-06-30" })).find(
      (f) => f.label === "Possession",
    );
    expect(fact).toEqual({ label: "Possession", value: "Under Construction" });
  });

  it("moves the expected date into the details, except for ready stock", () => {
    const building = buildDetailRows(project({ possessionDate: "2027-06-30" }));
    expect(building.find((r) => r.label === "Possession date")?.value).toBe("Jun 2027");
    const ready = buildDetailRows(
      project({ possessionDate: "2026-10-30", possessionStatus: "ready_to_move" }),
    );
    expect(ready.find((r) => r.label === "Possession date")).toBeUndefined();
  });
});

describe("projectCoordinates", () => {
  const withPin = (latitude: unknown, longitude: unknown) =>
    ({ latitude, longitude }) as unknown as ProjectDetail;

  it("parses the string decimals the API sends", () => {
    expect(projectCoordinates(withPin("11.0796991", "76.9997393"))).toEqual({
      lat: 11.0796991,
      lon: 76.9997393,
    });
  });

  it("returns null when either half is missing or the pair is out of range", () => {
    expect(projectCoordinates(withPin(null, null))).toBeNull();
    expect(projectCoordinates(withPin("11.07", null))).toBeNull();
    expect(projectCoordinates(withPin("95", "76"))).toBeNull();
    expect(projectCoordinates(withPin("abc", "76"))).toBeNull();
    expect(projectCoordinates(withPin("0", "0"))).toBeNull();
  });
});
