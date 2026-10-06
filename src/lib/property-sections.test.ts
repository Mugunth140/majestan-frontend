import { describe, expect, it } from "vitest";
import {
  getFarmlandSpecs,
  getFloorPlanLabel,
  getLandPricePerUnit,
  getPlotSpecs,
  getVisibleSingleSections,
  isGroundPlanType,
} from "./property-sections";
import type { SeoProperty } from "./api/property-by-slug";

const barePlot = {
  id: 1,
  propertyType: "plot",
  title: "T",
  price: "1000000",
  city: "Coimbatore",
  state: "Tamil Nadu",
  details: null,
  images: [],
  amenities: [],
  units: [],
  faqs: [],
} as unknown as SeoProperty;

describe("getVisibleSingleSections", () => {
  it("shows only locality when nothing else has data", () => {
    expect(getVisibleSingleSections(barePlot)).toEqual(["locality"]);
  });

  it("shows amenities when at least one amenity exists", () => {
    const p = {
      ...barePlot,
      amenities: [{ id: 1, amenity: { id: 1, name: "Pool" } }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["amenities", "locality"]);
  });

  it("shows photos when at least one image exists", () => {
    const p = {
      ...barePlot,
      images: [{ id: 1, imageUrl: "/p1.jpg", imageKey: "p1", isPrimary: true, createdAt: "" }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["locality", "photos"]);
  });

  it("shows floor-plan when plan files exist", () => {
    const p = {
      ...barePlot,
      floorPlanFiles: [{ title: "Plan", imageUrl: "/plan.jpg", imageKey: "f1" }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["floor-plan", "locality"]);
  });

  it("counts section FAQs as data for that section", () => {
    const p = {
      ...barePlot,
      faqs: [{ id: 1, question: "Q", answer: "A", section: "amenities", sortOrder: 0 }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["amenities", "locality"]);
  });

  it("shows floor-plan when core measurements exist", () => {
    const p = {
      ...barePlot,
      propertyType: "commercial",
      details: { areaSqft: "1200.00" },
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["floor-plan", "locality"]);
  });

  it("hides ground-plan for plot with only measurements (no plan uploaded)", () => {
    const p = {
      ...barePlot,
      details: { areaSqft: "1200.00" },
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["locality"]);
  });

  it("shows ground-plan for farmland once a plan is uploaded", () => {
    const p = {
      ...barePlot,
      propertyType: "farmland",
      floorPlanFiles: [{ title: "Plan", imageUrl: "/plan.jpg", imageKey: "f1" }],
    } as unknown as SeoProperty;
    expect(getVisibleSingleSections(p)).toEqual(["floor-plan", "locality"]);
  });
});

describe("getPlotSpecs", () => {
  const plotDetails = {
    plotArea: "2400.00",
    areaUnit: "Sq Ft",
    plotLength: "40",
    plotWidth: "60",
    propertyFacing: "East",
    plotType: "Residential",
    zoning: "Residential",
    roadWidth: "30 ft",
    boundaryWall: true,
    suitableFor: "Villa",
  };

  it("returns plot-relevant rows in priority order", () => {
    const labels = getPlotSpecs(plotDetails).map((r) => r.label);
    expect(labels).toEqual([
      "Plot Area",
      "Dimension",
      "Facing",
      "Plot Type",
      "Zoning",
      "Road Width",
      "Boundary Wall",
      "Suitable For",
    ]);
  });

  it("formats dimension from length and width", () => {
    const dim = getPlotSpecs(plotDetails).find((r) => r.label === "Dimension");
    expect(dim?.value).toBe("40 × 60 ft");
  });

  it("falls back to open sides when no boundary wall", () => {
    const rows = getPlotSpecs({ ...plotDetails, boundaryWall: null, openSides: 2 });
    const labels = rows.map((r) => r.label);
    expect(labels).not.toContain("Boundary Wall");
    expect(labels).toContain("Open Sides");
  });

  it("returns no rows when nothing is stored", () => {
    expect(getPlotSpecs({})).toEqual([]);
  });

  it("shows water and land type from real plot data", () => {
    const rows = getPlotSpecs({ waterSources: "BORE WATER", landType: "RESIDENTIAL LAND" });
    expect(rows).toMatchObject([
      { label: "Water Sources", value: "BORE WATER" },
      { label: "Land Type", value: "RESIDENTIAL LAND" },
    ]);
  });

  it("falls back to area in cents when only areaSqft-in-cents is stored", () => {
    const rows = getPlotSpecs({ areaSqft: "4.00", areaUnit: "Cents" });
    expect(rows).toMatchObject([{ label: "Plot Area", value: "4 cents" }]);
  });
});

describe("getFarmlandSpecs", () => {
  const farmDetails = {
    plotSizeCents: "50.0000",
    waterSources: "Borewell + Canal",
    cropSuitability: "Coconut, Banana",
    soilType: "Red Loam",
    landType: "Wet Land",
    topography: "Flat",
    existingPlantation: "Coconut trees",
    boundaryWall: true,
    sfNumber: "123/4",
    boreWell: true,
    propertyFacing: "East",
  };

  it("returns richer agronomy rows in priority order", () => {
    const labels = getFarmlandSpecs(farmDetails).map((r) => r.label);
    expect(labels).toEqual([
      "Farm Area",
      "Water Sources",
      "Crop Suitability",
      "Soil Type",
      "Land Type",
      "Topography",
      "Existing Plantation",
      "Fencing",
      "SF Number",
      "Bore Well",
    ]);
  });

  it("prefers irrigation label when only irrigation is stored", () => {
    const rows = getFarmlandSpecs({ irrigation: "Canal" });
    expect(rows[0]).toMatchObject({ label: "Irrigation", value: "Canal" });
  });

  it("falls back to facing when no crop data exists", () => {
    const rows = getFarmlandSpecs({ propertyFacing: "East" });
    expect(rows.map((r) => r.label)).toContain("Facing");
  });

  it("shows plot no, plot type, zoning, storage tank and suitable use", () => {
    const rows = getFarmlandSpecs({
      plotNos: 4,
      plotType: "Center Plot",
      zoning: "Residential",
      storageTank: true,
      suitableFor: "Organic Farming",
    });
    expect(rows.map((r) => r.label)).toEqual([
      "Plot No",
      "Plot Type",
      "Zoning",
      "Storage Tank",
      "Suitable For",
    ]);
  });

  it("falls back to the fencing string when no boundary wall is stored", () => {
    const rows = getFarmlandSpecs({ fencing: "Available" });
    expect(rows).toMatchObject([{ label: "Fencing", value: "Available" }]);
  });

  it("falls back to area in cents when only areaSqft-in-cents is stored", () => {
    const rows = getFarmlandSpecs({ areaSqft: "6.00", areaUnit: "Cents" });
    expect(rows).toMatchObject([{ label: "Farm Area", value: "6 cents" }]);
  });

  it("carries more rows than a comparable plot", () => {
    const plotRows = getPlotSpecs({ plotArea: "2400", propertyFacing: "East" });
    const farmRows = getFarmlandSpecs({
      plotSizeCents: "50",
      propertyFacing: "East",
      soilType: "Red Loam",
      cropSuitability: "Coconut",
      waterSources: "Borewell",
    });
    expect(farmRows.length).toBeGreaterThan(plotRows.length);
  });
});

describe("getLandPricePerUnit", () => {
  it("prices land per cent when cents are known", () => {
    expect(getLandPricePerUnit("5000000", { plotSizeCents: "50" }, "plot")).toBe(
      "₹ 1,00,000/cent"
    );
  });

  it("returns null when cents are unknown", () => {
    expect(getLandPricePerUnit("5000000", { plotArea: "2400" }, "plot")).toBeNull();
    expect(getLandPricePerUnit("5000000", {}, "farmland")).toBeNull();
  });
});

describe("getFloorPlanLabel", () => {
  it.each(["plot", "farmland"])("returns Ground Plan for %s", (t) => {
    expect(isGroundPlanType(t)).toBe(true);
    expect(getFloorPlanLabel(t)).toBe("Ground Plan");
  });

  it.each(["apartment", "villa", "commercial", "coworking", "other"])(
    "returns Floor Plan for %s",
    (t) => {
      expect(isGroundPlanType(t)).toBe(false);
      expect(getFloorPlanLabel(t)).toBe("Floor Plan");
    }
  );

  it("returns Site Plan for industrial", () => {
    expect(getFloorPlanLabel("industrial")).toBe("Site Plan");
  });
});
