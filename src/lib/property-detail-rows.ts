import {
  Accessibility, Armchair, BadgeCheck, Bath, Box, Briefcase, Building2,
  Calendar, Car, Coffee, Compass, DoorOpen, Droplets, Fence, FileText, Flame,
  Hash, Home, IndianRupee, Landmark, Layers, Leaf, MapPin, Maximize2, Plug,
  Ruler, ShieldCheck, Snowflake, Sofa, Sprout, Train, TreePine, Truck, Users,
  Warehouse, Wifi, Zap, type LucideIcon,
} from "lucide-react";
import type { SeoProperty } from "./api/property-by-slug";
import { formatDate } from "./property-format";
import { formatPlotArea } from "./property-sections";

export type PropertyDetailRow = { label: string; value: string; icon: LucideIcon; wide?: boolean };

function text(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const trimmed = String(value).trim();
  return trimmed && !["-", "—", "null", "undefined"].includes(trimmed.toLowerCase()) ? trimmed : null;
}
function positive(value: unknown): number | null {
  if (value == null || typeof value === "boolean" || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}
function quantity(value: unknown, unit = ""): string | null {
  const number = positive(value);
  return number == null ? null : `${number.toLocaleString("en-IN", { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}`;
}
function money(value: unknown): string | null {
  const stored = text(value);
  if (!stored) return null;
  // CRM financial terms can include text such as "2 months" or "₹2,000/month".
  // Format bare amounts only; never turn those terms into a different amount.
  if (!/^\d+(?:\.\d+)?$/.test(stored)) return stored;
  return positive(stored) == null ? null : `₹ ${Number(stored).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
function yesNo(value: unknown): string | null {
  return typeof value === "boolean" ? (value ? "Yes" : "No") : null;
}
function date(value: unknown): string | null {
  const stored = text(value);
  return stored ? formatDate(stored) : null;
}

/**
 * Public CRM facts missing from the overview's existing rows. This intentionally
 * does not change the shared sidebar/spec helpers or commercial listings.
 * Explicit false is "No"; unknown values, empty text and zero count defaults hide.
 */
export function getAdditionalPropertyDetails(property: SeoProperty, existingLabels: readonly string[] = []): PropertyDetailRow[] {
  if (property.propertyType === "commercial") return [];
  const d = property.details;
  const isLand = property.propertyType === "plot" || property.propertyType === "farmland";
  const isHome = ["apartment", "villa", "individual_portion"].includes(property.propertyType);
  const isRent = /rent|lease/i.test(property.listingType) || /rent/i.test(property.status);
  const rows: PropertyDetailRow[] = [];
  const seen = new Set(existingLabels);
  const add = (label: string, value: string | null, icon: LucideIcon, wide = false) => {
    if (!value || seen.has(label)) return;
    seen.add(label);
    rows.push({ label, value, icon, wide: wide || value.length > 65 });
  };

  add("Ownership", text(property.ownershipType), Landmark);
  add("Sale Type", text(property.saleType), FileText);
  add("Road Access", text(property.roadAccess), MapPin);
  add("Road Name", text(property.roadName), MapPin);
  add("Approvals", text(property.approvals) ?? text(d?.approvals), BadgeCheck);
  add("Available From", date(property.availableFrom), Calendar);
  add("Available Until", date(property.availableUntil), Calendar);
  if (property.reraNumber && !/^(not applicable|n\/?a)$/i.test(property.reraNumber.trim())) {
    add("RERA Number", text(property.reraNumber), BadgeCheck);
  }
  if (!isRent) {
    add("Booking Amount", money(property.bookingAmount), IndianRupee);
    add("Registration Timeline", text(property.timeForRegistration), Calendar);
  }

  if (!isLand) {
    add("Property Condition", text(property.propertyCondition), Home);
    add("Project Name", text(property.projectName), Building2);
    add("Builder", text(property.builderName), Building2);
    add("Transaction Type", text(property.transactionType), FileText);
    add("Handover Date", date(property.handoverDate), Calendar);
    add("Possession Status", text(d?.possessionStatus), Calendar);
    add("Property Age", text(d?.propertyAge), Calendar);
    add("Tenant Occupied", text(property.tenantOccupied), Users);
    add("Facing", text(d?.propertyFacing), Compass);
    add("Floor Facing", text(d?.floorFacing), Compass);
    add("Floors Occupied", d?.floorsOccupied?.map(text).filter(Boolean).join(", ") || null, Layers);
    if (!seen.has("Floor No") && !seen.has("Floor")) {
      add("Floor", text(d?.floorNumber), Layers);
      add("Total Floors", quantity(d?.totalFloors), Building2);
    }
    add("Parking Type", text(d?.parkingType), Car);
    add("Guest Parking", yesNo(d?.guestParking), Car);
    add("Open Sides", quantity(d?.openSides), Maximize2);
    add("Suitable For", text(d?.suitableFor), Users);
    add("Restroom", yesNo(d?.hasRestroom), Bath);
    add("Maintenance Charges", money(property.maintenanceCharges), IndianRupee);
    if (isRent) {
      add("Security Deposit", money(property.securityDeposit), IndianRupee);
      add("Lock In Period", text(property.lockInPeriod), Calendar);
    }
  }

  if (isHome) {
    add("Unit Type", text(d?.unitType), Home);
    add("Unit Number", text(d?.unitNumber), Hash);
    add("Number of Flats", quantity(d?.numberOfFlats), Building2);
    add("Towers", quantity(d?.towerNos), Building2);
    add("Built-Up Area", quantity(d?.builtUpArea, "sq.ft"), Maximize2);
    add("Carpet Area", quantity(d?.carpetArea, "sq.ft"), Ruler);
    add("Super Built-Up Area", quantity(d?.superBuiltUpArea, "sq.ft"), Maximize2);
    add("UDS Area", quantity(d?.udsArea, "sq.ft"), Maximize2);
    add("Plot Area", formatPlotArea(d?.plotArea, d?.areaUnit, d?.measurementUnits?.plotArea), Ruler);
    add("Balconies", quantity(d?.balconies), DoorOpen);
    add("Water Supply", text(d?.waterSupply), Droplets);
    add("Power Backup", yesNo(d?.powerBackup), Zap);
    add("Pooja Room", yesNo(d?.poojaRoom), Flame);
    add("Study Room", yesNo(d?.studyRoom), Briefcase);
    add("Architectural Style", text(d?.architecturalStyle), Home);
    add("Available Portion", text(d?.availablePortion), Layers);
    add("Additional Amenities", text(d?.amenities), Armchair, true);
    add("Outdoor Spaces", text(d?.outdoorSpaces), TreePine, true);
    add("Utilities Provided", text(d?.utilitiesProvided), Plug, true);
    add("Neighbourhood Highlights", text(d?.neighborhoodHighlights), MapPin, true);
    add("Community Facilities", text(d?.communityFacilities), Users, true);
  }

  if (isLand) {
    add("Plot No", quantity(d?.plotNos), Hash);
    add("SF Number", text(d?.sfNumber), Hash);
    add("Facing", text(d?.propertyFacing), Compass);
    // Existing land summaries suppress some of these when another value exists.
    add("Boundary Wall", yesNo(d?.boundaryWall), Fence);
    add("Open Sides", quantity(d?.openSides), Maximize2);
    add("Topography", text(d?.topography), MapPin);
    add("Soil Type", text(d?.soilType), Leaf);
    add("Irrigation", text(d?.irrigation), Droplets);
    add(seen.has("Fencing") && d?.boundaryWall ? "Fence Type" : "Fencing", text(d?.fencing), Fence);
    add("Road Width", text(d?.roadWidth), Ruler);
    if (!seen.has("Dimension")) {
      const length = quantity(d?.plotLength);
      const width = quantity(d?.plotWidth);
      if (length && width) add("Dimension", `${length} × ${width} ft`, Ruler);
      else {
        add("Plot Length", quantity(d?.plotLength, "ft"), Ruler);
        add("Plot Width", quantity(d?.plotWidth, "ft"), Ruler);
      }
    }
    if (property.propertyType === "farmland") {
      add("Bore Well", yesNo(d?.boreWell), Droplets);
      add("Storage Tank", yesNo(d?.storageTank), Droplets);
      add("Crop Suitability", text(d?.cropSuitability), Sprout);
      add("Existing Plantation", text(d?.existingPlantation), TreePine);
    }
  }

  if (property.propertyType === "industrial") {
    add("Building Type", text(d?.buildingType), Warehouse);
    add("Property Use", text(d?.propertyUse), Warehouse);
    add("Bays", quantity(d?.numberOfBays), Box);
    add("Cabins", quantity(d?.numberOfCabins), Briefcase);
    add("Loading Bays", quantity(d?.loadingBays), Truck);
    add("Warehouse Racks", quantity(d?.warehouseRacks), Warehouse);
    add("Water Supply", text(d?.waterSupply), Droplets);
    add("Fire Safety", yesNo(d?.fireSafety), Flame);
    add("Power Backup", yesNo(d?.powerBackup), Zap);
    add("Heavy Vehicle Access", yesNo(d?.heavyVehicleAccess), Truck);
    add("Truck / Trailer Access", yesNo(d?.truckTrailerAccess), Truck);
    add("Truck / Trailer Capacity", quantity(d?.truckTrailerCount), Truck);
    add("Crane Available", yesNo(d?.craneAvailable), Warehouse);
    add("Additional Power Supply", text(d?.powerSupply2), Plug);
    add("Other Power Supply", text(d?.powerSupply3), Plug);
    add("Public Transport Access", text(d?.publicTransportAccess), Train);
    add("Nearest Highway", text(d?.nearestHighway), MapPin);
    add("Nearest Railway", text(d?.nearestRailway), Train);
    add("Nearest Port", text(d?.nearestPort), MapPin);
    add("Nearest Airport", text(d?.nearestAirport), MapPin);
    add("Labour Availability", text(d?.labourAvailability), Users);
    add("Worker Facilities", text(d?.workerFacilities), Users, true);
    add("Ownership Proof", text(d?.ownershipProofVerified), FileText);
    add("Building Approval", text(d?.buildingApprovalCert), FileText);
    add("Pollution Clearance", text(d?.pollutionClearance), Leaf);
    add("Layout Plan", text(d?.blueprintLayout), Ruler);
    add("Other Legal Clearances", text(d?.otherLegalClearance), FileText);
    add("Clearance Details", text(d?.otherLegalDetails), FileText, true);
  }

  if (property.propertyType === "coworking") {
    add("Built-Up Area", quantity(d?.builtUpArea, "sq.ft"), Maximize2);
    add("Carpet Area", seen.has("Total Area") ? null : quantity(d?.carpetArea, "sq.ft"), Ruler);
    add("Advance Rent", money(d?.advanceRent), IndianRupee);
    add("Lease Term", text(d?.leaseTerm), Calendar);
    add("Rent Escalation", text(d?.incrementalRent), IndianRupee);
    add("Electricity Charges", text(d?.electricityCharges), Plug);
    add("High Speed WiFi", yesNo(d?.highSpeedWifi), Wifi);
    add("Air Conditioning", yesNo(d?.airConditioning), Snowflake);
    add("CCTV Surveillance", yesNo(d?.cctvSurveillance), ShieldCheck);
    add("Power Backup", yesNo(d?.powerBackup), Zap);
    add("Elevator Access", yesNo(d?.elevatorAccess), Building2);
    add("Pantry", yesNo(d?.hasPantry), Coffee);
    add("Security Staff", yesNo(d?.securityStaff), ShieldCheck);
    add("Furniture Provided", text(d?.furnitureProvided), Sofa, true);
    add("Accessibility", text(d?.accessibility), Accessibility, true);
  }

  return rows;
}
