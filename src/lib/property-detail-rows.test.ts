import { describe, expect, it } from "vitest";
import type { SeoProperty, SeoPropertyDetails } from "./api/property-by-slug";
import { getAdditionalPropertyDetails } from "./property-detail-rows";
import { formatPlotArea, getFarmlandSpecs, getPlotSpecs } from "./property-sections";

type Details = Partial<NonNullable<SeoPropertyDetails>>;
const listing = (propertyType: string, details: Details = {}, extras: Partial<SeoProperty> = {}) => ({
  id: 1, propertyType, title: "Listing", city: "Coimbatore", state: "Tamil Nadu",
  price: "8500000", listingType: "Sell", status: "Available", details,
  ...extras,
} as SeoProperty);
const values = (property: SeoProperty, labels: string[] = []) =>
  Object.fromEntries(getAdditionalPropertyDetails(property, labels).map((row) => [row.label, row.value]));

const homeDetails: Details = {
  unitType: "3 BHK", unitNumber: "A 403", numberOfFlats: 42, towerNos: 2,
  builtUpArea: "1456.00", carpetArea: "1210.50", superBuiltUpArea: "1650.00", udsArea: "410.00",
  plotArea: "2400", areaUnit: "Sq Ft", balconies: 2, propertyFacing: "East", floorFacing: "North",
  possessionStatus: "Ready to Move", propertyAge: "1 to 3 years", guestParking: true,
  parkingType: "Open", poojaRoom: true, studyRoom: false,
  architecturalStyle: "Contemporary", availablePortion: "First floor",
  outdoorSpaces: "Private garden", utilitiesProvided: "Solar hot water",
  neighborhoodHighlights: "Schools nearby", communityFacilities: "Walking track",
};

describe("CRM facts in property details", () => {
  it.each(["apartment", "villa", "individual_portion"])("shows residential facts and measurements for %s", (propertyType) => {
    const rows = values(listing(propertyType, homeDetails));
    expect(rows).toMatchObject({
      "Unit Type": "3 BHK", "Unit Number": "A 403", "Number of Flats": "42", Towers: "2",
      "Built-Up Area": "1,456 sq.ft", "Carpet Area": "1,210.5 sq.ft", "UDS Area": "410 sq.ft",
      "Super Built-Up Area": "1,650 sq.ft", "Plot Area": "2,400 sq.ft", Balconies: "2",
      Facing: "East", "Floor Facing": "North", "Guest Parking": "Yes", "Parking Type": "Open",
      "Pooja Room": "Yes", "Study Room": "No", "Outdoor Spaces": "Private garden",
      "Utilities Provided": "Solar hot water", "Community Facilities": "Walking track",
    });
  });

  it("shows plot fields the old summary skipped, including both boundary and open sides", () => {
    const details = {
      plotArea: "2400", areaUnit: "Sq Ft", plotNos: 17, sfNumber: "114/2B", boundaryWall: true,
      openSides: 2, topography: "Level", soilType: "Red soil", waterSources: "Bore water",
      irrigation: "Canal", fencing: "Wire fencing",
    };
    const existing = getPlotSpecs(details).map((row) => row.label);
    expect(values(listing("plot", details), existing)).toMatchObject({
      "Plot No": "17", "SF Number": "114/2B", "Open Sides": "2", Topography: "Level",
      "Soil Type": "Red soil", Irrigation: "Canal", Fencing: "Wire fencing",
    });
  });

  it("shows farmland facing alongside crop data and keeps the separate water and fence details", () => {
    const details = {
      cropSuitability: "Coconut", propertyFacing: "West", waterSources: "Well", irrigation: "Drip",
      plotLength: 120, plotWidth: 80, boundaryWall: true, openSides: 3, fencing: "Wire fencing",
      boreWell: false, storageTank: true,
    };
    expect(values(listing("farmland", details), getFarmlandSpecs(details).map((row) => row.label))).toMatchObject({
      Facing: "West", Irrigation: "Drip", "Boundary Wall": "Yes", "Open Sides": "3",
      "Fence Type": "Wire fencing", "Bore Well": "No", Dimension: "120 × 80 ft",
    });
  });

  it("shows partial land dimensions without making up the missing dimension", () => {
    const rows = values(listing("plot", { plotLength: "63.5", plotWidth: null }));
    expect(rows["Plot Length"]).toBe("63.5 ft");
    expect(rows["Plot Width"]).toBeUndefined();
    expect(rows.Dimension).toBeUndefined();
  });

  it("does not repeat a farmland fence already shown by the summary", () => {
    const details = { fencing: "Wire fencing", boundaryWall: false };
    const rows = values(listing("farmland", details), getFarmlandSpecs(details).map((row) => row.label));
    expect(rows["Fence Type"]).toBeUndefined();
    expect(rows.Fencing).toBeUndefined();
    expect(rows["Boundary Wall"]).toBe("No");
  });

  it("shows land availability even without a property details record", () => {
    expect(values(listing("plot", {}, { details: null, availableFrom: "2026-11-03" })))
      .toEqual({ "Available From": "3 Nov 2026" });
  });

  it("shows industrial construction, facilities, access and clearance facts", () => {
    expect(values(listing("industrial", {
      buildingType: "Warehouse", propertyUse: "Storage", numberOfBays: 4, numberOfCabins: 2,
      loadingBays: 3, warehouseRacks: 18, fireSafety: true, waterSupply: "Bore water",
      powerSupply2: "Three phase", truckTrailerAccess: true, truckTrailerCount: 5,
      craneAvailable: false, workerFacilities: "Rest area and canteen", nearestHighway: "NH 544, 2 km",
      publicTransportAccess: "Bus stop, 450 m", buildingApprovalCert: "Available", pollutionClearance: "Not required",
    }))).toMatchObject({
      "Building Type": "Warehouse", "Property Use": "Storage", Bays: "4", Cabins: "2", "Loading Bays": "3",
      "Warehouse Racks": "18", "Fire Safety": "Yes", "Water Supply": "Bore water",
      "Additional Power Supply": "Three phase", "Truck / Trailer Access": "Yes", "Truck / Trailer Capacity": "5",
      "Crane Available": "No", "Worker Facilities": "Rest area and canteen", "Nearest Highway": "NH 544, 2 km",
      "Public Transport Access": "Bus stop, 450 m", "Building Approval": "Available", "Pollution Clearance": "Not required",
    });
  });

  it("shows coworking services, furniture, accessibility and lease terms", () => {
    expect(values(listing("coworking", {
      builtUpArea: "3500", advanceRent: "36000.00", leaseTerm: "12 months", incrementalRent: "5% annually",
      electricityCharges: "Included", highSpeedWifi: true, airConditioning: true, cctvSurveillance: true,
      elevatorAccess: false, hasPantry: true, securityStaff: true, furnitureProvided: "Desks and chairs",
      accessibility: "Ramp at entrance",
    }, { listingType: "Rent", securityDeposit: "24000", lockInPeriod: "6 months" }))).toMatchObject({
      "Built-Up Area": "3,500 sq.ft", "Advance Rent": "₹ 36,000", "Lease Term": "12 months",
      "Rent Escalation": "5% annually", "Electricity Charges": "Included", "High Speed WiFi": "Yes",
      "Air Conditioning": "Yes", "CCTV Surveillance": "Yes", "Elevator Access": "No", Pantry: "Yes",
      "Security Staff": "Yes", "Furniture Provided": "Desks and chairs", Accessibility: "Ramp at entrance",
      "Security Deposit": "₹ 24,000", "Lock In Period": "6 months",
    });
  });

  it("shows stored common facts for other types without borrowing home or industrial fields", () => {
    const rows = values(listing("other", { propertyAge: "5 years", poojaRoom: true, craneAvailable: true }, {
      propertyCondition: "Resale", ownershipType: "Freehold", roadAccess: "30 ft road",
    }));
    expect(rows).toMatchObject({ "Property Age": "5 years", "Property Condition": "Resale", Ownership: "Freehold", "Road Access": "30 ft road" });
    expect(rows["Pooja Room"]).toBeUndefined();
    expect(rows["Crane Available"]).toBeUndefined();
  });

  it("leaves commercial listings completely unchanged even when more CRM fields are present", () => {
    expect(getAdditionalPropertyDetails(listing("commercial", homeDetails, {
      ownershipType: "Freehold", builderName: "Builder", maintenanceCharges: "2500",
    }))).toEqual([]);
  });

  it("omits unknown and malformed values while preserving explicit false and floor zero", () => {
    const rows = values(listing("villa", {
      unitNumber: " ", balconies: 0, numberOfFlats: NaN, towerNos: Infinity, udsArea: "invalid",
      studyRoom: false, poojaRoom: null, guestParking: null, floorNumber: "0",
    }));
    expect(rows).toEqual({ Floor: "0", "Study Room": "No" });
  });

  it("does not repeat rows already shown or relabel rental terms as currency", () => {
    const property = listing("coworking", { powerBackup: true, builtUpArea: "3000", carpetArea: "2700" }, {
      listingType: "Rent", maintenanceCharges: "₹2,000/month", securityDeposit: "2 months",
      availableFrom: "2026-11-03", bookingAmount: "50000",
    });
    const rows = values(property, ["Power Backup", "Built-Up Area", "Total Area"]);
    expect(rows).toMatchObject({ "Maintenance Charges": "₹2,000/month", "Security Deposit": "2 months", "Available From": "3 Nov 2026" });
    for (const label of ["Power Backup", "Built-Up Area", "Carpet Area", "Booking Amount"]) expect(rows[label]).toBeUndefined();
  });

  it("keeps textual CRM notes on full rows without adding irrelevant building facts to land", () => {
    expect(getAdditionalPropertyDetails(listing("villa", { utilitiesProvided: "Solar water and rainwater storage" }))
      .find((row) => row.label === "Utilities Provided")?.wide).toBe(true);
    expect(values(listing("plot", { poojaRoom: true, propertyAge: "5 years", airConditioning: true }))).toEqual({});
  });

  it("respects square metres from the CRM area selector", () => {
    expect(formatPlotArea("150.50", "Sq M")).toBe("150.5 sq.m");
    expect(values(listing("villa", { plotArea: "150.50", areaUnit: "Sq M" }))["Plot Area"]).toBe("150.5 sq.m");
  });
});
