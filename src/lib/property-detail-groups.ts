import type { SeoProperty } from "./api/property-by-slug";
import { formatDate, formatFurnishing } from "./property-format";
import { formatPlotArea } from "./property-sections";

/**
 * "Property details", organised into categories for every property type.
 *
 * Homes (apartment, villa, individual house) follow the client's document:
 * its categories, its order, and the fields it marked "remove" hidden per
 * type and Buy/Rent (see HIDDEN_FIELDS). Land, commercial, industrial and
 * coworking listings get categories that fit their own fields.
 *
 * Every field is optional: empty values are skipped, a category with
 * nothing in it is dropped, and each field shows once, in the first
 * category that lists it.
 */

export type DetailField = { label: string; value: string; wide?: boolean };
export type DetailGroup = { title: string; fields: DetailField[] };

const HOME_TYPES = ["apartment", "villa", "individual_portion"] as const;

type Mode = "sale" | "rent";

/**
 * Fields the client asked to remove, per type and Buy/Rent. Combinations
 * their document didn't cover follow the nearest one it did: apartment rent
 * follows apartment sale, and villa rent follows individual-house rent.
 */
const HIDDEN_FIELDS: Record<string, readonly string[]> = {
  "apartment:sale": [
    "Unit Number",
    "Architectural Style",
    "Sale Type",
    "Built-Up Area",
    "Restroom",
    "Available Until",
    "Handover Date",
  ],
  "apartment:rent": [
    "Unit Number",
    "Architectural Style",
    "Sale Type",
    "Built-Up Area",
    "Restroom",
    "Available Until",
    "Handover Date",
    "Transaction Type",
    "Ownership",
  ],
  "villa:sale": ["Property Condition"],
  "villa:rent": ["Property Condition", "Transaction Type", "Architectural Style", "Ownership", "Sale Type"],
  "individual_portion:sale": [],
  "individual_portion:rent": ["Transaction Type", "Architectural Style", "Ownership", "Sale Type"],
};

/* ── Value formatting ──────────────────────────────────────────────── */

function text(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const trimmed = String(value).trim();
  return trimmed && !["-", "—", "null", "undefined", "n/a", "na"].includes(trimmed.toLowerCase()) ? trimmed : null;
}

function positive(value: unknown): number | null {
  if (value == null || typeof value === "boolean" || String(value).trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const trimNum = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

const count = (value: unknown) => {
  const n = positive(value);
  return n == null ? null : trimNum(n);
};

const sqft = (value: unknown) => {
  const n = positive(value);
  return n == null ? null : `${trimNum(n)} sq.ft`;
};

const withUnit = (value: unknown, unit: string) => {
  const n = positive(value);
  return n == null ? null : `${trimNum(n)} ${unit}`;
};

/** "₹ 85,00,000" for bare amounts; CRM text such as "2 months" passes through. */
function money(value: unknown): string | null {
  const stored = text(value);
  if (!stored) return null;
  if (!/^\d+(?:\.\d+)?$/.test(stored)) return stored;
  const n = positive(stored);
  return n == null ? null : `₹ ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/** Yes/no facilities read as the client writes them. */
function availability(value: unknown): string | null {
  return typeof value === "boolean" ? (value ? "Available" : "Not Available") : null;
}

/** Yes/no questions ("Heavy vehicle access?"). */
function yesNo(value: unknown): string | null {
  return typeof value === "boolean" ? (value ? "Yes" : "No") : null;
}

function day(value: unknown): string | null {
  const stored = text(value);
  return stored ? formatDate(stored) : null;
}

/** "1" → "1st Floor", "G"/"0" → "Ground Floor"; other text as stored. */
function floorLabel(value: unknown): string | null {
  const stored = text(value);
  if (!stored) return null;
  if (/^(0|g|ground)$/i.test(stored)) return "Ground Floor";
  if (!/^\d+$/.test(stored)) return stored;
  const n = Number(stored);
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix} Floor`;
}

/** Resale listings say whether a tenant is in: "Resale – Occupied". */
function occupancy(transactionType: unknown, tenantOccupied: unknown): string | null {
  const type = text(transactionType);
  const tenant = text(tenantOccupied);
  if (!type || !/resale/i.test(type) || !tenant) return null;
  const occupied = /^(yes|true|occupied)$/i.test(tenant);
  return `${type} – ${occupied ? "Occupied" : "Unoccupied"}`;
}

/** Plot dimension: the stored text, else "40 × 60 ft" from length and width. */
function dimension(d: Details): string | null {
  const direct = text(d?.dimension);
  if (direct) return direct;
  const length = positive(d?.plotLength);
  const width = positive(d?.plotWidth);
  return length && width ? `${trimNum(length)} × ${trimNum(width)} ft` : null;
}

/** Plot area in cents when stored that way, else in its stored unit. */
function plotArea(d: Details): string | null {
  const cents = positive(d?.plotSizeCents);
  if (cents) return `${trimNum(cents)} cents`;
  return formatPlotArea(d?.plotArea, d?.areaUnit);
}

const list = (value: unknown): string | null =>
  Array.isArray(value) ? value.map(text).filter(Boolean).join(", ") || null : text(value);

const typeLabel = (type: string) =>
  type === "individual_portion"
    ? "Individual House"
    : type === "coworking"
      ? "Co-working Space"
      : type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ── Builders ───────────────────────────────────────────────────────── */

type Details = SeoProperty["details"];
type Field = [string, string | null];
type Ctx = {
  property: SeoProperty;
  d: Details;
  type: string;
  isSale: boolean;
  /** Price per sq.ft / per cent, computed by the page. */
  pricePerUnit: string | null;
};

/** Collects categories, skipping empty and hidden fields and repeats. */
function collector(hidden: ReadonlySet<string>) {
  const groups: DetailGroup[] = [];
  const shown = new Set<string>();
  const group = (title: string, fields: Field[]) => {
    const kept: DetailField[] = [];
    for (const [label, value] of fields) {
      if (!value || hidden.has(label) || shown.has(label)) continue;
      shown.add(label);
      kept.push({ label, value, wide: value.length > 60 });
    }
    if (kept.length > 0) groups.push({ title, fields: kept });
  };
  return { groups, group };
}

const priceLabel = (pricePerUnit: string | null) =>
  pricePerUnit && /cent/i.test(pricePerUnit) ? "Price per Cent" : "Price per Sq. Ft.";

/** Pricing fields every type shares; sale vs rent decides which apply. */
function pricing({ property, isSale, pricePerUnit }: Ctx): Field[] {
  return [
    [priceLabel(pricePerUnit), pricePerUnit],
    ["Approximate Property Value", isSale ? money(property.price) : null],
    ["Booking Amount", isSale ? money(property.bookingAmount) : null],
    ["Security Deposit", isSale ? null : money(property.securityDeposit)],
    ["Lock-in Period", isSale ? null : text(property.lockInPeriod)],
    ["Ownership", text(property.ownershipType)],
    ["Sale Type", isSale ? text(property.saleType) : null],
    ["Registration Timeline", isSale ? text(property.timeForRegistration) : null],
  ];
}

function location({ property, d }: Ctx, facingLabel = "Facing"): Field[] {
  return [
    ["Road Name", text(property.roadName)],
    ["Road Access", text(property.roadAccess)],
    ["Road Width", text(d?.roadWidth)],
    ["Open Sides", count(d?.openSides)],
    [facingLabel, text(d?.propertyFacing)],
  ];
}

function approvals({ property, d }: Ctx): Field[] {
  const rera = text(property.reraNumber);
  return [
    ["Approvals", text(property.approvals) ?? text(d?.approvals)],
    ["RERA Number", rera && !/^(not applicable|n\/?a)$/i.test(rera) ? rera : null],
  ];
}

function availabilityFields({ property, d }: Ctx): Field[] {
  return [
    ["Possession Status", text(d?.possessionStatus)],
    ["Transaction Status", occupancy(property.transactionType, property.tenantOccupied)],
    ["Listed On", day(property.createdAt)],
    ["Available From", day(property.availableFrom)],
    ["Available Until", day(property.availableUntil)],
    ["Handover Date", day(property.handoverDate)],
  ];
}

function overview({ property, d, type }: Ctx, extra: Field[] = []): Field[] {
  return [
    ["Property ID", text(property.propertyCode)],
    ["Project Name", text(property.projectName)],
    ["Property Type", typeLabel(type)],
    ...extra,
    ["Transaction Type", text(property.transactionType)],
    ["Builder", text(property.builderName)],
    ["Suitable For", text(d?.suitableFor)],
  ];
}

/* Homes: the client's document. */
function homeGroups(ctx: Ctx, hidden: ReadonlySet<string>): DetailGroup[] {
  const { property, d, type, isSale } = ctx;
  const isApartment = type === "apartment";
  const { groups, group } = collector(hidden);

  group("Property Overview", [
    ["Property ID", text(property.propertyCode)],
    ["Project Name", text(property.projectName)],
    ["Property Type", typeLabel(type)],
    ["Unit Type", text(d?.unitType)],
    ["Transaction Type", text(property.transactionType)],
    ["Unit Number", text(d?.unitNumber)],
    ["Builder", text(property.builderName)],
    // Apartments list condition under pricing; the other types list it here.
    ["Property Condition", isApartment ? null : text(property.propertyCondition)],
    ["Architectural Style", text(d?.architecturalStyle)],
    ["Suitable For", text(d?.suitableFor)],
  ]);

  group("Pricing & Transaction Details", [
    ...pricing(ctx),
    ["Property Condition", isApartment ? text(property.propertyCondition) : null],
  ]);

  group("Area & Dimensions", [
    ["Built-Up Area", sqft(d?.builtUpArea)],
    ["Super Built-Up Area", sqft(d?.superBuiltUpArea)],
    ["Carpet Area", sqft(d?.carpetArea)],
    ["Undivided Share of Land (UDS)", sqft(d?.udsArea)],
    ["Plot Area", isApartment ? null : formatPlotArea(d?.plotArea, d?.areaUnit)],
    // Fall back to the generic area only when no specific figure is stored.
    ["Area", !d?.builtUpArea && !d?.superBuiltUpArea && !d?.carpetArea ? sqft(d?.areaSqft) : null],
  ]);

  group("Bedrooms & Interior Features", [
    ["Bedrooms", count(d?.bedrooms)],
    ["Bathrooms", count(d?.bathrooms)],
    ["Balconies", count(d?.balconies)],
    ["Furnishing", formatFurnishing(d) ?? null],
    ["Pooja Room", availability(d?.poojaRoom)],
    ["Study Room", availability(d?.studyRoom)],
    ["Restroom", availability(d?.hasRestroom)],
  ]);

  group("Location & Connectivity", [
    ...location(ctx, isApartment ? "Property Facing" : "Facing"),
    ["Floor Facing", isApartment ? text(d?.floorFacing) : null],
  ]);

  group(isApartment ? "Floor & Building Details" : "Building Details", [
    ["Floor Number", isApartment ? floorLabel(d?.floorNumber) : null],
    ["Total Floors", count(d?.totalFloors)],
    ["Total Towers", isApartment ? count(d?.towerNos) : null],
    ["Total Flats in Project", isApartment ? count(d?.numberOfFlats) : null],
    ["Property Age", text(d?.propertyAge)],
  ]);

  group(isApartment ? "Parking & Maintenance" : "Parking & Facilities", [
    ["Parking Type", text(d?.parkingType) ?? (positive(d?.parking) ? `${d!.parking} Covered` : null)],
    ["Guest Parking", availability(d?.guestParking)],
    ["Monthly Maintenance Charges", money(property.maintenanceCharges)],
    ["Water Supply", text(d?.waterSupply)],
    ["Power Backup", availability(d?.powerBackup)],
  ]);

  group(type === "individual_portion" && isSale ? "Legal & Approval Details" : "Approvals & Ownership", approvals(ctx));

  group("Availability & Possession", [
    ["Possession Status", text(d?.possessionStatus)],
    [
      type === "individual_portion" ? "Occupancy Status" : "Transaction Status",
      occupancy(property.transactionType, property.tenantOccupied),
    ],
    ["Tenant Occupied", isApartment ? text(property.tenantOccupied) : null],
    ["Listed On", day(property.createdAt)],
    ["Available From", day(property.availableFrom)],
    ["Available Until", day(property.availableUntil)],
    ["Handover Date", day(property.handoverDate)],
  ]);

  group("Additional Details", [
    ["Available Portion", text(d?.availablePortion)],
    ["Additional Amenities", text(d?.amenities)],
    ["Outdoor Spaces", text(d?.outdoorSpaces)],
    ["Utilities Provided", text(d?.utilitiesProvided)],
    ["Neighbourhood Highlights", text(d?.neighborhoodHighlights)],
    ["Community Facilities", text(d?.communityFacilities)],
  ]);

  return groups;
}

/* Plot and farmland. */
function landGroups(ctx: Ctx): DetailGroup[] {
  const { d, type } = ctx;
  const isFarm = type === "farmland";
  const { groups, group } = collector(new Set());

  group("Property Overview", overview(ctx, [
    ["Plot Type", text(d?.plotType)],
    ["Land Type", text(d?.landType)],
    ["Zoning", text(d?.zoning)],
  ]));
  group("Pricing & Transaction Details", pricing(ctx));
  group(isFarm ? "Land Area & Dimensions" : "Plot Area & Dimensions", [
    [isFarm ? "Farm Area" : "Plot Area", plotArea(d)],
    ["Dimension", dimension(d)],
    ["Plot No", count(d?.plotNos)],
    ["SF Number", text(d?.sfNumber)],
  ]);
  group(isFarm ? "Land & Agriculture" : "Land Features", [
    ["Topography", text(d?.topography)],
    ["Soil Type", text(d?.soilType)],
    ["Irrigation", text(d?.irrigation)],
    ["Water Sources", list(d?.waterSources)],
    ["Water Supply", text(d?.waterSupply)],
    ["Bore Well", isFarm ? yesNo(d?.boreWell) : null],
    ["Storage Tank", isFarm ? yesNo(d?.storageTank) : null],
    ["Crop Suitability", isFarm ? text(d?.cropSuitability) : null],
    ["Existing Plantation", isFarm ? text(d?.existingPlantation) : null],
    ["Boundary Wall", yesNo(d?.boundaryWall)],
    ["Fencing", text(d?.fencing)],
    ["Property Age", isFarm ? text(d?.propertyAge) : null],
  ]);
  group("Location & Connectivity", location(ctx));
  group("Approvals & Ownership", approvals(ctx));
  group("Availability & Possession", availabilityFields(ctx));
  return groups;
}

/* Commercial spaces (offices, showrooms, shops). */
function commercialGroups(ctx: Ctx): DetailGroup[] {
  const { property, d } = ctx;
  const { groups, group } = collector(new Set());

  group("Property Overview", overview(ctx, [
    ["Property Use", text(d?.propertyUse)],
    ["Property Condition", text(property.propertyCondition)],
  ]));
  group("Pricing & Transaction Details", [
    ...pricing(ctx),
    ["Monthly Maintenance Charges", money(property.maintenanceCharges)],
  ]);
  group("Area & Dimensions", [
    ["Super Built-Up Area", sqft(d?.superBuiltUpArea)],
    ["Built-Up Area", sqft(d?.builtUpArea)],
    ["Carpet Area", sqft(d?.carpetArea)],
    ["Area", !d?.builtUpArea && !d?.superBuiltUpArea && !d?.carpetArea ? sqft(d?.areaSqft) : null],
    ["Plot Area", formatPlotArea(d?.plotArea, d?.areaUnit)],
  ]);
  group("Floor & Building Details", [
    ["Floors Occupied", list(d?.floorsOccupied)],
    ["Floor Number", floorLabel(d?.floorNumber)],
    ["Total Floors", count(d?.totalFloors)],
    ["Building Type", text(d?.buildingType)],
    ["Property Age", text(d?.propertyAge)],
  ]);
  group("Workspace & Facilities", [
    ["Furnishing", formatFurnishing(d) ?? null],
    ["Washrooms", count(d?.bathrooms)],
    ["Pantry", availability(d?.hasPantry)],
    ["Central AC", availability(d?.hasCentralAc)],
    ["Power Backup", availability(d?.powerBackup)],
    ["Water Supply", text(d?.waterSupply)],
    ["Restroom", availability(d?.hasRestroom)],
  ]);
  group("Location & Connectivity", [
    ...location(ctx),
    ["Public Transport Access", text(d?.publicTransportAccess)],
  ]);
  group("Parking", [
    ["Parking Type", text(d?.parkingType)],
    ["Parking", positive(d?.parking) ? `${d!.parking} Spaces` : null],
    ["Car Parking", count(d?.carParking)],
    ["Bike Parking", count(d?.bikeParking)],
    ["Guest Parking", availability(d?.guestParking)],
  ]);
  group("Approvals & Ownership", approvals(ctx));
  group("Availability & Possession", availabilityFields(ctx));
  return groups;
}

/* Industrial sheds, warehouses and factories. */
function industrialGroups(ctx: Ctx): DetailGroup[] {
  const { property, d } = ctx;
  const { groups, group } = collector(new Set());

  group("Property Overview", overview(ctx, [
    ["Building Type", text(d?.buildingType)],
    ["Property Use", text(d?.propertyUse)],
    ["Property Condition", text(property.propertyCondition)],
  ]));
  group("Pricing & Transaction Details", [
    ...pricing(ctx),
    ["Monthly Maintenance Charges", money(property.maintenanceCharges)],
  ]);
  group("Area & Structure", [
    ["Plot Area", formatPlotArea(d?.plotArea, d?.areaUnit)],
    ["Built-Up Area", sqft(d?.builtUpArea) ?? sqft(d?.areaSqft)],
    ["Covered Area", sqft(d?.coveredArea)],
    ["Open Area", sqft(d?.openArea)],
    ["Ceiling Height", withUnit(d?.ceilingHeightFt, "ft")],
    ["Floor Type", text(d?.floorType)],
    ["Total Floors", count(d?.totalFloors)],
    ["Property Age", text(d?.propertyAge)],
  ]);
  group("Power & Utilities", [
    ["Power Supply", withUnit(d?.powerSupplyHp, "HP")],
    ["Additional Power Supply", text(d?.powerSupply2)],
    ["Other Power Supply", text(d?.powerSupply3)],
    ["Power Backup", availability(d?.powerBackup)],
    ["Water Supply", text(d?.waterSupply)],
    ["Fire Safety", availability(d?.fireSafety)],
  ]);
  group("Operations & Logistics", [
    ["Bays", count(d?.numberOfBays)],
    ["Loading Bays", count(d?.loadingBays)],
    ["Cabins", count(d?.numberOfCabins)],
    ["Warehouse Racks", count(d?.warehouseRacks)],
    ["Washrooms", count(d?.bathrooms)],
    ["Heavy Vehicle Access", yesNo(d?.heavyVehicleAccess)],
    ["Truck / Trailer Access", yesNo(d?.truckTrailerAccess)],
    ["Truck / Trailer Capacity", count(d?.truckTrailerCount)],
    ["Truck Parking", count(d?.truckParking)],
    ["Crane Available", yesNo(d?.craneAvailable)],
    ["Labour Availability", text(d?.labourAvailability)],
    ["Worker Facilities", text(d?.workerFacilities)],
  ]);
  group("Location & Connectivity", [
    ...location(ctx),
    ["Nearest Highway", text(d?.nearestHighway)],
    ["Nearest Railway", text(d?.nearestRailway)],
    ["Nearest Port", text(d?.nearestPort)],
    ["Nearest Airport", text(d?.nearestAirport)],
    ["Public Transport Access", text(d?.publicTransportAccess)],
  ]);
  group("Legal & Compliance", [
    ...approvals(ctx),
    ["Ownership Proof", text(d?.ownershipProofVerified)],
    ["Building Approval", text(d?.buildingApprovalCert)],
    ["Pollution Clearance", text(d?.pollutionClearance)],
    ["Layout Plan", text(d?.blueprintLayout)],
    ["Other Legal Clearances", text(d?.otherLegalClearance)],
    ["Clearance Details", text(d?.otherLegalDetails)],
  ]);
  group("Availability & Possession", availabilityFields(ctx));
  return groups;
}

/* Co-working spaces. */
function coworkingGroups(ctx: Ctx): DetailGroup[] {
  const { property, d } = ctx;
  const { groups, group } = collector(new Set());

  group("Property Overview", overview(ctx));
  group("Pricing & Terms", [
    ["Rent / Seat", money(d?.rentPerSeat)],
    ["Advance Rent", money(d?.advanceRent)],
    ...pricing(ctx),
    ["Lease Term", text(d?.leaseTerm)],
    ["Rent Escalation", text(d?.incrementalRent)],
    ["Electricity Charges", text(d?.electricityCharges)],
    ["Monthly Maintenance Charges", money(property.maintenanceCharges)],
  ]);
  group("Space & Capacity", [
    ["Seats", count(d?.minSeats)],
    ["Workstations", count(d?.availableWorkstations)],
    ["Private Cabins", count(d?.privateCabins)],
    ["Meeting Rooms", count(d?.meetingRooms)],
    ["Total Area", sqft(d?.carpetArea)],
    ["Built-Up Area", sqft(d?.builtUpArea) ?? sqft(d?.areaSqft)],
    ["Floor Number", floorLabel(d?.floorNumber)],
    ["Total Floors", count(d?.totalFloors)],
  ]);
  group("Amenities & Facilities", [
    ["High Speed WiFi", availability(d?.highSpeedWifi)],
    ["Air Conditioning", availability(d?.airConditioning)],
    ["CCTV Surveillance", availability(d?.cctvSurveillance)],
    ["Power Backup", availability(d?.powerBackup)],
    ["Elevator Access", availability(d?.elevatorAccess)],
    ["Pantry", availability(d?.hasPantry)],
    ["Security Staff", availability(d?.securityStaff)],
    ["Restroom", availability(d?.hasRestroom)],
    ["Washrooms", count(d?.bathrooms)],
    ["Furniture Provided", text(d?.furnitureProvided)],
    ["Accessibility", text(d?.accessibility)],
  ]);
  group("Location & Connectivity", [
    ...location(ctx),
    ["Public Transport Access", text(d?.publicTransportAccess)],
  ]);
  group("Parking", [
    ["Parking", positive(d?.parking) ? `${d!.parking} Spaces` : null],
    ["Car Parking", count(d?.carParking)],
    ["Bike Parking", count(d?.bikeParking)],
  ]);
  group("Availability & Possession", availabilityFields(ctx));
  return groups;
}

export function getGroupedPropertyDetails(
  property: SeoProperty,
  extras: { pricePerSqft?: string | null } = {},
): DetailGroup[] {
  const type = property.propertyType;
  const mode: Mode = /rent|lease/i.test(property.listingType ?? "") ? "rent" : "sale";
  const ctx: Ctx = {
    property,
    d: property.details,
    type,
    isSale: mode === "sale",
    pricePerUnit: extras.pricePerSqft ?? null,
  };

  switch (type) {
    case "plot":
    case "farmland":
      return landGroups(ctx);
    case "commercial":
      return commercialGroups(ctx);
    case "industrial":
      return industrialGroups(ctx);
    case "coworking":
      return coworkingGroups(ctx);
    default:
      // Homes follow the client's document; any other type uses the same
      // general layout with no fields removed.
      return homeGroups(
        ctx,
        new Set((HOME_TYPES as readonly string[]).includes(type) ? HIDDEN_FIELDS[`${type}:${mode}`] ?? [] : []),
      );
  }
}
