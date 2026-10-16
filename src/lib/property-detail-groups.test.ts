import { describe, expect, it } from "vitest";
import { getGroupedPropertyDetails } from "./property-detail-groups";
import type { SeoProperty } from "./api/property-by-slug";

/** A home listing with every field the client's document mentions filled in. */
const full = (propertyType: string, listingType: string): SeoProperty =>
  ({
    id: 1,
    propertyCode: "AP2559",
    propertyType,
    listingType,
    price: "8500000",
    createdAt: "2026-10-15T10:00:00.000Z",
    projectName: "Icon City",
    builderName: "TNCD",
    transactionType: "Resale",
    propertyCondition: "Resale",
    ownershipType: "Freehold",
    saleType: "Full Sale",
    bookingAmount: "500000",
    timeForRegistration: "Within 1 Month",
    lockInPeriod: "1 Year",
    roadName: "Avinashi Road",
    roadAccess: "30 Feet",
    approvals: "DTCP",
    tenantOccupied: "No",
    maintenanceCharges: "3000",
    availableFrom: "2026-10-15",
    availableUntil: "2026-12-15",
    handoverDate: "2026-11-15",
    details: {
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      areaSqft: "1059",
      builtUpArea: "1059",
      superBuiltUpArea: "1059",
      carpetArea: "840",
      udsArea: "498",
      unitType: "2 BHK",
      unitNumber: "A-101",
      architecturalStyle: "Modern",
      suitableFor: "Family",
      furnishingStatus: "FULLY FURNISHED",
      poojaRoom: true,
      studyRoom: true,
      hasRestroom: false,
      openSides: 2,
      propertyFacing: "North",
      floorFacing: "North",
      floorNumber: "1",
      totalFloors: 5,
      towerNos: 1,
      numberOfFlats: 120,
      propertyAge: "4–6 Years",
      parkingType: "Covered Parking",
      guestParking: true,
      possessionStatus: "Ready to Move",
    },
  }) as unknown as SeoProperty;

const labels = (p: SeoProperty) =>
  getGroupedPropertyDetails(p, { pricePerSqft: "₹ 8,026 / sq.ft" }).flatMap((g) => g.fields.map((f) => f.label));
const titles = (p: SeoProperty) => getGroupedPropertyDetails(p).map((g) => g.title);

describe("property detail groups", () => {
  it("apartment sale: the client's categories, in order", () => {
    expect(titles(full("apartment", "sale"))).toEqual([
      "Property Overview",
      "Pricing & Transaction Details",
      "Area & Dimensions",
      "Bedrooms & Interior Features",
      "Location & Connectivity",
      "Floor & Building Details",
      "Parking & Maintenance",
      "Approvals & Ownership",
      "Availability & Possession",
    ]);
  });

  it("apartment sale: removes what the client struck out", () => {
    const shown = labels(full("apartment", "sale"));
    for (const removed of ["Unit Number", "Architectural Style", "Sale Type", "Built-Up Area", "Restroom", "Available Until", "Handover Date"]) {
      expect(shown).not.toContain(removed);
    }
    for (const kept of ["Builder", "Suitable For", "Booking Amount", "Super Built-Up Area", "Undivided Share of Land (UDS)", "Floor Facing", "Total Flats in Project", "Monthly Maintenance Charges", "Transaction Status", "Tenant Occupied"]) {
      expect(shown).toContain(kept);
    }
  });

  it("individual house rent: removes transaction type, style, ownership and sale type", () => {
    const shown = labels(full("individual_portion", "rent"));
    for (const removed of ["Transaction Type", "Architectural Style", "Ownership", "Sale Type", "Booking Amount"]) {
      expect(shown).not.toContain(removed);
    }
    expect(shown).toContain("Lock-in Period");
    expect(shown).toContain("Property Condition");
  });

  it("villa sale: removes property condition, keeps style and ownership", () => {
    const shown = labels(full("villa", "sale"));
    expect(shown).not.toContain("Property Condition");
    expect(shown).toContain("Architectural Style");
    expect(shown).toContain("Ownership");
    expect(titles(full("villa", "sale"))).toContain("Building Details");
  });

  it("individual house sale: keeps everything and labels occupancy and legal sections", () => {
    const groups = getGroupedPropertyDetails(full("individual_portion", "sale"));
    const shown = groups.flatMap((g) => g.fields.map((f) => f.label));
    for (const kept of ["Transaction Type", "Property Condition", "Architectural Style", "Ownership", "Sale Type", "Occupancy Status"]) {
      expect(shown).toContain(kept);
    }
    expect(groups.map((g) => g.title)).toContain("Legal & Approval Details");
  });

  it("formats values the way the client writes them", () => {
    const fields = Object.fromEntries(
      getGroupedPropertyDetails(full("apartment", "sale")).flatMap((g) => g.fields.map((f) => [f.label, f.value])),
    );
    expect(fields["Approximate Property Value"]).toBe("₹ 85,00,000");
    expect(fields["Floor Number"]).toBe("1st Floor");
    expect(fields["Pooja Room"]).toBe("Available");
    expect(fields["Guest Parking"]).toBe("Available");
    expect(fields["Transaction Status"]).toBe("Resale – Unoccupied");
    expect(fields["Carpet Area"]).toBe("840 sq.ft");
  });

  it("shows each field once and drops empty categories", () => {
    const sparse = { ...full("villa", "sale"), approvals: null, reraNumber: null, details: { bedrooms: 3 } } as unknown as SeoProperty;
    const groups = getGroupedPropertyDetails(sparse);
    expect(groups.map((g) => g.title)).not.toContain("Approvals & Ownership");
    const all = groups.flatMap((g) => g.fields.map((f) => f.label));
    expect(new Set(all).size).toBe(all.length);
  });

  const listing = (propertyType: string, details: Record<string, unknown>, over: Record<string, unknown> = {}) =>
    ({ id: 2, propertyCode: "X1", propertyType, listingType: "sale", price: "5000000", createdAt: "2026-10-01", details, ...over }) as unknown as SeoProperty;
  const byTitle = (p: SeoProperty) =>
    Object.fromEntries(getGroupedPropertyDetails(p, { pricePerSqft: "₹ 1,20,000 / cent" }).map((g) => [g.title, g.fields.map((f) => f.label)]));

  it("plot: area and dimensions, land features and location get their own categories", () => {
    const groups = byTitle(listing("plot", {
      plotSizeCents: "4.5", plotLength: "40", plotWidth: "60", plotType: "Residential", boundaryWall: true, propertyFacing: "East",
    }, { roadName: "Avinashi Road", approvals: "DTCP" }));
    expect(groups["Property Overview"]).toContain("Plot Type");
    expect(groups["Pricing & Transaction Details"]).toContain("Price per Cent");
    expect(groups["Plot Area & Dimensions"]).toEqual(["Plot Area", "Dimension"]);
    expect(groups["Land Features"]).toContain("Boundary Wall");
    expect(groups["Location & Connectivity"]).toEqual(["Road Name", "Facing"]);
    expect(groups["Approvals & Ownership"]).toContain("Approvals");
  });

  it("farmland: agriculture fields under Land & Agriculture", () => {
    const groups = byTitle(listing("farmland", { plotArea: "2", areaUnit: "Acres", soilType: "Red", boreWell: true, cropSuitability: "Coconut" }));
    expect(groups["Land Area & Dimensions"]).toContain("Farm Area");
    expect(groups["Land & Agriculture"]).toEqual(["Soil Type", "Bore Well", "Crop Suitability"]);
  });

  it("commercial: floors, workspace facilities and parking", () => {
    const groups = byTitle(listing("commercial", {
      superBuiltUpArea: "2400", floorsOccupied: ["1", "2"], hasPantry: true, bathrooms: 2, carParking: 4,
    }));
    expect(groups["Area & Dimensions"]).toEqual(["Super Built-Up Area"]);
    expect(groups["Floor & Building Details"]).toContain("Floors Occupied");
    expect(groups["Workspace & Facilities"]).toEqual(["Washrooms", "Pantry"]);
    expect(groups["Parking"]).toEqual(["Car Parking"]);
  });

  it("industrial: structure, power, operations and compliance", () => {
    const groups = byTitle(listing("industrial", {
      builtUpArea: "10000", ceilingHeightFt: "30", powerSupplyHp: "100", loadingBays: 2, heavyVehicleAccess: true,
      nearestHighway: "NH 544", pollutionClearance: "Yes",
    }));
    expect(groups["Area & Structure"]).toEqual(["Built-Up Area", "Ceiling Height"]);
    expect(groups["Power & Utilities"]).toEqual(["Power Supply"]);
    expect(groups["Operations & Logistics"]).toEqual(["Loading Bays", "Heavy Vehicle Access"]);
    expect(groups["Location & Connectivity"]).toContain("Nearest Highway");
    expect(groups["Legal & Compliance"]).toContain("Pollution Clearance");
  });

  it("coworking: pricing terms, capacity and amenities", () => {
    const groups = byTitle(listing("coworking", {
      rentPerSeat: "6000", minSeats: 20, meetingRooms: 2, highSpeedWifi: true, airConditioning: true,
    }, { listingType: "rent" }));
    expect(groups["Pricing & Terms"]).toContain("Rent / Seat");
    expect(groups["Space & Capacity"]).toEqual(["Seats", "Meeting Rooms"]);
    expect(groups["Amenities & Facilities"]).toEqual(["High Speed WiFi", "Air Conditioning"]);
  });

  it("only homes have fields removed", () => {
    const shown = getGroupedPropertyDetails(listing("commercial", {}, { saleType: "Full Sale", ownershipType: "Freehold" }))
      .flatMap((g) => g.fields.map((f) => f.label));
    expect(shown).toContain("Sale Type");
    expect(shown).toContain("Ownership");
  });
});
