import { pgReadFields, isPgFurnished } from "./pg-accommodation";
import type { SeoProperty } from "./api/property-by-slug";

export interface PropertyCurationDetails {
  pgDetails?: Record<string, unknown> | null;
  individualBathrooms?: number | null;
  attachedBathrooms?: number | null;
  portions?: { bhk: string; count: number }[];
  parkingSpaces?: { vehicle: string; type: string; count: number }[];
  passengerLifts?: number | null;
  serviceLifts?: number | null;
  agricultureEb?: number | null;
  roadApproach?: string | null;
  storageTankCapacity?: string | null;
  powerSupplyCapacity?: string | null;
  hasCanteen?: boolean | null;
  hasFreeRefreshment?: boolean | null;
  restroomCount?: number | null;
  totalRentPerMonth?: number | null;
  expectedRentPerMonth?: number | null;
  expectedMonthlyRentPerSqft?: number | null;
  availableFloorNumbers?: string | null;
  propertyUses?: string[];
  specialPurposes?: string[];
  utilities?: string[];
}

export function getBathroomCount(
  details:
    | { bathrooms?: number; curationDetails?: PropertyCurationDetails | null }
    | null
    | undefined,
): number {
  const split = details?.curationDetails;
  if (split?.individualBathrooms != null || split?.attachedBathrooms != null) {
    return (
      Number(split.individualBathrooms ?? 0) +
      Number(split.attachedBathrooms ?? 0)
    );
  }
  return Number(details?.bathrooms ?? 0);
}

/** Public property facts only. Owner/agent contacts remain private in the API. */
export function curationDetailRows(
  property: SeoProperty,
): { label: string; value: string; wide?: boolean }[] {
  const d = property.details;
  const c = d?.curationDetails;
  if (!c) return [];
  const rows: { label: string; value: string; wide?: boolean }[] = [];
  const add = (label: string, value: unknown) => {
    if (
      value == null ||
      value === "" ||
      (typeof value === "number" && (!Number.isFinite(value) || value <= 0))
    )
      return;
    rows.push({ label, value: String(value), wide: String(value).length > 60 });
  };
  const home = [
    "apartment",
    "villa",
    "individual_portion",
    "investment_property",
    "farm_house",
    "pg_service_apartment",
  ].includes(property.propertyType);
  const rent = /rent|lease/i.test(property.listingType);
  if (home && (c.individualBathrooms != null || c.attachedBathrooms != null))
    add(
      "Bathroom Breakdown",
      `${c.individualBathrooms ?? 0} individual + ${c.attachedBathrooms ?? 0} attached = ${getBathroomCount(d)} bathrooms`,
    );
  if (
    [
      "individual_portion",
      "investment_property",
      "farm_house",
      "commercial",
    ].includes(property.propertyType)
  )
    add(
      "Portion Configurations",
      c.portions
        ?.filter((p) => p.count > 0)
        .map((p) => `${p.bhk} × ${p.count}`)
        .join(", "),
    );
  if (
    ["apartment", "villa", "investment_property"].includes(property.propertyType) ||
    (property.propertyType === "commercial" && !rent)
  )
    add(
      "Parking Spaces",
      c.parkingSpaces
        ?.filter((p) => p.count > 0)
        .map((p) => `${p.vehicle} ${p.type} × ${p.count}`)
        .join(", ") || (Array.isArray(c.parkingSpaces) ? "No parking" : undefined),
    );
  if (property.propertyType === "commercial" && rent) {
    add("Passenger Lifts", c.passengerLifts);
    add("Service Lifts", c.serviceLifts);
    add("Property Use", c.propertyUses?.join(", "));
    add("Special Purpose", c.specialPurposes?.join(", "));
    add("Utilities Provided", c.utilities?.join(", "));
  }
  if (
    ["individual_portion", "investment_property"].includes(
      property.propertyType,
    ) &&
    rent
  )
    add("Available Floor Numbers", c.availableFloorNumbers);
  if (["farmland", "farm_house"].includes(property.propertyType)) {
    add("Agriculture EB", c.agricultureEb);
    add("Road Approach", c.roadApproach);
    add("Storage Tank Capacity", c.storageTankCapacity);
  }
  if (property.propertyType === "investment_property") {
    if (c.totalRentPerMonth != null)
      add(
        "Total Rent per Month",
        `₹ ${Number(c.totalRentPerMonth).toLocaleString("en-IN")}`,
      );
    if (c.expectedRentPerMonth != null)
      add(
        "Expected Rent per Month",
        `₹ ${Number(c.expectedRentPerMonth).toLocaleString("en-IN")}`,
      );
  }
  if (
    property.propertyType === "commercial" &&
    !rent &&
    c.expectedMonthlyRentPerSqft != null
  )
    add(
      "Expected Monthly Rent per Sqft",
      `₹ ${Number(c.expectedMonthlyRentPerSqft).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
    );
  if (property.propertyType === "industrial") {
    add("Power Supply", c.powerSupplyCapacity);
    if (typeof c.hasCanteen === "boolean")
      add("Canteen", c.hasCanteen ? "Yes" : "No");
  }
  if (property.propertyType === "coworking") {
    if (d?.hasRestroom) add("No of Rest Rooms", c.restroomCount);
    if (typeof c.hasFreeRefreshment === "boolean")
      add("Free Refreshment", c.hasFreeRefreshment ? "Yes" : "No");
  }
  if (property.propertyType === "pg_service_apartment") rows.push(...pgReadFields(c.pgDetails).filter(row => !["In room furnishings", "Common area furnishings"].includes(row.label) || isPgFurnished(d?.furnishingStatus)));
  return rows;
}

export function getCoworkingSeatRent(
  details: { rentPerSeat?: string | number | null } | null | undefined,
): number | null {
  const value = Number(details?.rentPerSeat);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function industrialPowerLabel(
  details:
    | {
        powerSupplyHp?: string | number | null;
        curationDetails?: PropertyCurationDetails | null;
      }
    | null
    | undefined,
): string | null {
  if (
    details?.curationDetails &&
    Object.hasOwn(details.curationDetails, "powerSupplyCapacity")
  )
    return details.curationDetails.powerSupplyCapacity?.trim() || null;
  const legacy = Number(details?.powerSupplyHp);
  return Number.isFinite(legacy) && legacy > 0 ? `${legacy} HP` : null;
}
