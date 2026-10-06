import { describe, expect, it } from "vitest";
import {
  formatPlotArea,
  getCommercialSpecs,
  getCoworkingSpecs,
  getFarmlandSpecs,
  getFloorPlanLabel,
  getIndustrialSpecs,
  getLandPricePerUnit,
  getPlotSpecs,
  getTypeMeasurements,
  getVisibleSingleSections,
  hasGroundPlanData,
  isGroundPlanType,
  workspaceAmenitySuffix,
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

  it("reads plot area in cents when the area unit is cents", () => {
    const rows = getPlotSpecs({ plotArea: "5.5", areaUnit: "Cents" });
    expect(rows).toMatchObject([{ label: "Plot Area", value: "5.5 cents" }]);
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

describe("getCommercialSpecs", () => {
  const officeDetails = {
    superBuiltUpArea: "3000.00",
    bathrooms: 2,
    floorsOccupied: ["Ground", "1st"],
    totalFloors: 5,
    parking: 10,
    furnishingStatus: "FULLY FURNISHED",
    hasPantry: true,
    hasCentralAc: true,
    powerBackup: true,
  };

  it("returns office-relevant rows in priority order", () => {
    const labels = getCommercialSpecs(officeDetails).map((r) => r.label);
    expect(labels).toEqual([
      "Built-Up Area",
      "Washrooms",
      "Floors Occupied",
      "Furnishing",
      "Total Floors",
      "Parking",
      "Pantry",
      "Central AC",
      "Power Backup",
    ]);
  });

  it("formats floors and parking for offices", () => {
    const rows = getCommercialSpecs(officeDetails);
    expect(rows.find((r) => r.label === "Floors Occupied")?.value).toBe("Ground, 1st");
    expect(rows.find((r) => r.label === "Parking")?.value).toBe("10 Spaces");
    expect(rows.find((r) => r.label === "Furnishing")?.value).toBe("Fully Furnished");
  });

  it("prefers carpet area when no super built-up exists", () => {
    const rows = getCommercialSpecs({ carpetArea: "2500" });
    expect(rows).toMatchObject([{ label: "Carpet Area", value: "2,500 sq.ft" }]);
  });

  it("falls back to areaSqft for built-up area", () => {
    const rows = getCommercialSpecs({ areaSqft: "2000" });
    expect(rows).toMatchObject([{ label: "Built-Up Area", value: "2,000 sq.ft" }]);
  });

  it("returns no rows when nothing is stored", () => {
    expect(getCommercialSpecs({})).toEqual([]);
  });
});

describe("getIndustrialSpecs", () => {
  const shedDetails = {
    builtUpArea: "10000.00",
    coveredArea: "8000",
    openArea: "2000",
    ceilingHeightFt: "24",
    floorType: "Concrete",
    powerSupplyHp: "50",
    powerBackup: true,
    heavyVehicleAccess: true,
    truckParking: 5,
    carParking: 10,
    bikeParking: 20,
    roadWidth: "40 ft",
    bathrooms: 2,
  };

  it("returns shed-relevant rows in priority order", () => {
    const labels = getIndustrialSpecs(shedDetails).map((r) => r.label);
    expect(labels).toEqual([
      "Built-Up Area",
      "Power Supply",
      "Ceiling Height",
      "Heavy Vehicle Access",
      "Covered Area",
      "Open Area",
      "Floor Type",
      "Power Backup",
      "Truck Parking",
      "Car Parking",
      "Bike Parking",
      "Road Width",
      "Washrooms",
    ]);
  });

  it("formats power and ceiling with units", () => {
    const rows = getIndustrialSpecs(shedDetails);
    expect(rows.find((r) => r.label === "Power Supply")?.value).toBe("50 HP");
    expect(rows.find((r) => r.label === "Ceiling Height")?.value).toBe("24 ft");
  });

  it("returns no rows when nothing is stored", () => {
    expect(getIndustrialSpecs({})).toEqual([]);
  });
});

describe("getCoworkingSpecs", () => {
  const coworkDetails = {
    minSeats: 4,
    rentPerSeat: 8000,
    privateCabins: 2,
    meetingRooms: 1,
    availableWorkstations: 30,
    carpetArea: "5000",
    floorNumber: "2",
    totalFloors: 6,
    parking: 5,
    hasRestroom: true,
    powerBackup: true,
    bathrooms: 4,
  };

  it("returns seat-relevant rows in priority order", () => {
    const labels = getCoworkingSpecs(coworkDetails).map((r) => r.label);
    expect(labels).toEqual([
      "Seats",
      "Rent / Seat",
      "Private Cabins",
      "Meeting Rooms",
      "Workstations",
      "Total Area",
      "Floor",
      "Parking",
      "Restroom",
      "Power Backup",
      "Washrooms",
    ]);
  });

  it("formats rent per seat in rupees", () => {
    const rows = getCoworkingSpecs(coworkDetails);
    expect(rows.find((r) => r.label === "Rent / Seat")?.value).toBe("₹ 8,000");
  });

  it("falls back to areaSqft for built-up area", () => {
    const rows = getCoworkingSpecs({ areaSqft: "5000" });
    expect(rows).toMatchObject([{ label: "Built-Up Area", value: "5,000 sq.ft" }]);
  });

  it("returns no rows when nothing is stored", () => {
    expect(getCoworkingSpecs({})).toEqual([]);
  });
});

describe("getTypeMeasurements", () => {
  it("returns residential measurements for apartments", () => {
    const m = getTypeMeasurements(
      { areaSqft: "1456", bedrooms: 3, bathrooms: 2, parking: 1 },
      "apartment"
    );
    expect(m.map((r) => r.label)).toEqual(["Total Area", "Bedrooms", "Bathrooms", "Parking"]);
  });

  it("returns office measurements for commercial", () => {
    const m = getTypeMeasurements(
      { superBuiltUpArea: "3000", bathrooms: 2, parking: 10, floorsOccupied: ["Ground", "1st"] },
      "commercial"
    );
    expect(m.map((r) => r.label)).toEqual(["Total Area", "Washrooms", "Parking", "Floors"]);
    expect(m.find((r) => r.label === "Washrooms")?.value).toBe("2 Washrooms");
  });

  it("returns shed measurements for industrial", () => {
    const m = getTypeMeasurements(
      { builtUpArea: "10000", coveredArea: "8000", openArea: "2000", powerSupplyHp: "50" },
      "industrial"
    );
    expect(m.map((r) => r.label)).toEqual(["Built-Up Area", "Covered Area", "Open Area", "Power Supply"]);
    expect(m.find((r) => r.label === "Power Supply")?.value).toBe("50 HP");
  });

  it("returns seat measurements for coworking", () => {
    const m = getTypeMeasurements(
      { minSeats: 4, privateCabins: 2, meetingRooms: 1, carpetArea: "5000" },
      "coworking"
    );
    expect(m.map((r) => r.label)).toEqual(["Seats", "Private Cabins", "Meeting Rooms", "Total Area"]);
  });
});

describe("workspaceAmenitySuffix", () => {
  it.each(["commercial", "industrial", "coworking"])(
    "returns the workspace suffix for %s",
    (t) => {
      expect(workspaceAmenitySuffix(t)).toBe(
        "including parking, power backup, and workspace facilities."
      );
    }
  );

  it.each(["apartment", "villa", "plot", "farmland", "other"])(
    "returns null for %s (default suffix applies)",
    (t) => {
      expect(workspaceAmenitySuffix(t)).toBeNull();
    }
  );
});

describe("hasGroundPlanData", () => {
  it("is true with detail plan images", () => {
    expect(
      hasGroundPlanData({ floorPlanImages: [{ title: "P", imageUrl: "/p.jpg", imageKey: "k" }] }, [])
    ).toBe(true);
  });

  it("is true with a unit plan image", () => {
    expect(hasGroundPlanData({}, [{ floorPlanImageUrl: "/u.jpg" }])).toBe(true);
  });

  it("is false with measures alone", () => {
    expect(hasGroundPlanData({ plotArea: "2400" }, [])).toBe(false);
    expect(hasGroundPlanData(null, null)).toBe(false);
  });
});

describe("formatPlotArea", () => {
  it("uses cents when the area unit is cents", () => {
    expect(formatPlotArea("5.5", "Cents")).toBe("5.5 cents");
  });

  it("uses acres when the area unit is acres", () => {
    expect(formatPlotArea("2", "Acres")).toBe("2 acres");
  });

  it("uses sq.ft otherwise", () => {
    expect(formatPlotArea("2400.00", "Sq Ft")).toBe("2,400 sq.ft");
    expect(formatPlotArea("2400.00", null)).toBe("2,400 sq.ft");
  });

  it("returns null for missing area", () => {
    expect(formatPlotArea(null, "Cents")).toBeNull();
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
