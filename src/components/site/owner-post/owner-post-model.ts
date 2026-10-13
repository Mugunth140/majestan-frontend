import { CENT_TO_SQFT } from "@/lib/api/projects";

export type Category =
  | "apartment"
  | "villa"
  | "individual_portion"
  | "plot"
  | "farmland"
  | "commercial"
  | "industrial"
  | "coworking";
export type ListingType = "Sell" | "Rent";
export type FieldValue = string | boolean;
export const AREA_UNITS = ["Sq Ft", "Cents", "Acres", "Grounds"] as const;
export type AreaUnit = (typeof AREA_UNITS)[number];

const SQFT_PER_AREA_UNIT: Record<AreaUnit, number> = {
  "Sq Ft": 1,
  Cents: CENT_TO_SQFT,
  Acres: 43560,
  Grounds: 2400,
};

export function normalizeAreaUnit(value: unknown): AreaUnit {
  return AREA_UNITS.includes(value as AreaUnit) ? (value as AreaUnit) : "Sq Ft";
}

export function areaToSqft(value: number, unit: AreaUnit | string): number {
  if (!Number.isFinite(value)) return NaN;
  return value * SQFT_PER_AREA_UNIT[normalizeAreaUnit(unit)];
}

export function sqftToArea(value: number, unit: AreaUnit | string): number {
  if (!Number.isFinite(value)) return NaN;
  return value / SQFT_PER_AREA_UNIT[normalizeAreaUnit(unit)];
}

/** Convert a typed amount while keeping its physical area unchanged. */
export function convertAreaAmount(
  value: string,
  from: AreaUnit | string,
  to: AreaUnit | string,
): string {
  if (!value.trim()) return "";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  const converted = sqftToArea(areaToSqft(amount, from), to);
  return Number(converted.toFixed(10)).toString();
}

function areaAmountIsValid(value: string): boolean {
  return /^\d+(\.\d{1,10})?$/.test(value);
}
export type Photo = {
  key: string;
  name: string;
  previewUrl?: string;
  localPreviewUrl?: string;
};
export type OwnerDraft = {
  version: 2;
  category: Category | "";
  listingType: ListingType;
  cityId: string;
  sublocationId: string;
  values: Record<string, FieldValue>;
  amenityIds: number[];
  furnishingIds: number[];
  photos: Photo[];
};
export type FormData = {
  cities: { id: number; city_name: string; state_name: string }[];
  sublocations: {
    id: number;
    city_id: number;
    locality_name: string;
    postal_code?: string | null;
  }[];
  amenities: { id: number; name: string; category?: string; iconKey?: string | null }[];
  furnishings: { id: number; name: string }[];
};
export type Field = {
  key: string;
  label: string;
  kind: "text" | "number" | "select" | "textarea" | "checkbox" | "date";
  scope: "top" | "details" | "location";
  step: 1 | 2 | 3;
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
  maxLength?: number;
  hint?: string;
  placeholder?: string;
  when?: (draft: OwnerDraft) => boolean;
};
export const CATEGORIES: {
  value: Category;
  label: string;
}[] = [
  {
    value: "apartment",
    label: "Apartment",
  },
  {
    value: "villa",
    label: "Villa",
  },
  {
    value: "individual_portion",
    label: "Independent house",
  },
  {
    value: "plot",
    label: "Residential plot",
  },
  {
    value: "farmland",
    label: "Farmland",
  },
  {
    value: "commercial",
    label: "Commercial space",
  },
  {
    value: "industrial",
    label: "Industrial space",
  },
  {
    value: "coworking",
    label: "Coworking space",
  },
];
export const STEPS = [
  { label: "Basic details" },
  { label: "Location" },
  { label: "Property profile" },
  { label: "Pricing" },
  { label: "Photos" },
  { label: "Review" },
];
const residential = (d: OwnerDraft) =>
  ["apartment", "villa", "individual_portion"].includes(d.category);
const land = (d: OwnerDraft) => ["plot", "farmland"].includes(d.category);
const building = (d: OwnerDraft) => !!d.category && !land(d);
const is =
  (...types: Category[]) =>
  (d: OwnerDraft) =>
    types.includes(d.category as Category);
const sale = (d: OwnerDraft) => d.listingType === "Sell";
const rent = (d: OwnerDraft) => d.listingType === "Rent";
const detail = (
  key: string,
  label: string,
  kind: Field["kind"],
  extra: Partial<Field> = {},
): Field => ({ key, label, kind, scope: "details", step: 2, ...extra });
const count = (
  key: string,
  label: string,
  when: Field["when"],
  required = false,
): Field =>
  detail(key, label, "number", {
    when,
    required,
    min: 0,
    max: 10000,
    integer: true,
  });
export const FIELDS: Field[] = [
  {
    key: "projectName",
    label: "Building or community name",
    kind: "text",
    scope: "top",
    step: 1,
    maxLength: 255,
    when: building,
    placeholder: "e.g. Green Park Apartments",
  },
  {
    key: "address",
    label: "Property address",
    kind: "textarea",
    scope: "location",
    step: 1,
    required: true,
    maxLength: 1000,
    hint: "Door number, street and a nearby landmark.",
  },
  {
    key: "pincode",
    label: "PIN code",
    kind: "text",
    scope: "location",
    step: 1,
    maxLength: 6,
    placeholder: "Optional, 6 digits",
  },
  {
    key: "title",
    label: "Listing title",
    kind: "text",
    scope: "top",
    step: 2,
    required: true,
    maxLength: 150,
    placeholder: "e.g. Spacious 3 BHK apartment in Saravanampatti",
  },
  {
    key: "description",
    label: "Describe your property",
    kind: "textarea",
    scope: "top",
    step: 2,
    required: true,
    maxLength: 5000,
    hint: "Share its condition, access, nearby landmarks and what makes it special.",
  },
  detail("areaSqft", "Property area (sq ft)", "number", {
    required: true,
    min: 1,
    max: 9999999999,
    hint: "Use built up area for a building or total land area for a plot or farm.",
  }),
  count("bedrooms", "Bedrooms", residential, true),
  count("bathrooms", "Bathrooms", residential, true),
  count("balconies", "Balconies", residential),
  detail("carpetArea", "Carpet area (sq ft)", "number", {
    when: building,
    min: 1,
  }),
  detail("buildUpArea", "Built up area (sq ft)", "number", {
    when: building,
    min: 1,
  }),
  detail("superBuiltUpArea", "Super built up area (sq ft)", "number", {
    when: is("apartment"),
    min: 1,
  }),
  detail("plotArea", "Plot area (sq ft)", "number", {
    when: is("villa", "individual_portion"),
    min: 1,
  }),
  detail("floorNumber", "Floor number", "text", {
    when: building,
    maxLength: 50,
    placeholder: "e.g. Ground or 3",
  }),
  count("totalFloors", "Total floors in the building", building),
  detail("facing", "Property facing", "select", {
    options: [
      "North",
      "South",
      "East",
      "West",
      "North East",
      "North West",
      "South East",
      "South West",
    ],
  }),
  detail("furnishingStatus", "Furnishing", "select", {
    when: building,
    options: ["UNFURNISHED", "SEMI FURNISHED", "FULLY FURNISHED", "BARESHELL"],
  }),
  detail("propertyAge", "Age of the property", "select", {
    when: building,
    options: [
      "New property",
      "1-3 Years",
      "4-6 Years",
      "7-10 Years",
      "10-14 Years",
      "15 & Above Years",
    ],
  }),
  detail("possessionStatus", "Possession status", "select", {
    when: (d) => building(d) && sale(d),
    options: ["Ready to move", "Under construction"],
  }),
  count("parking", "Car parking spaces", building),
  detail("parkingType", "Parking type", "select", {
    when: (d) => building(d) && Number(d.values.parking) > 0,
    options: ["Covered", "Open", "Both"],
  }),
  detail("waterSupply", "Water supply", "select", {
    when: building,
    options: [
      "24/7",
      "CORPORATION WATER",
      "BORE WATER",
      "NO WATER FACILITY",
      "COPORATION/BORE WATER MIXED",
    ],
  }),
  detail("poojaRoom", "Pooja room", "checkbox", { when: residential }),
  detail("studyRoom", "Study room", "checkbox", { when: residential }),
  detail("powerBackup", "Power backup", "checkbox", { when: building }),
  detail("plotLength", "Plot length (ft)", "number", { when: land, min: 1 }),
  detail("plotWidth", "Plot width (ft)", "number", { when: land, min: 1 }),
  detail("roadWidth", "Access road width (ft)", "text", {
    when: land,
    maxLength: 100,
  }),
  detail("boundaryWall", "Boundary wall", "checkbox", { when: land }),
  detail("landType", "Land type", "select", {
    when: is("farmland"),
    options: [
      "AGRICULUTURE LAND",
      "FARM LAND",
      "CONVERTED LAND",
      "DRY LAND",
      "WET LAND",
      "RESIDENTIAL LAND",
      "COMMERCIAL LAND",
    ],
  }),
  detail("soilType", "Soil type", "select", {
    when: is("farmland"),
    options: [
      "RED SOIL",
      "BLACK SOIL",
      "ALLUVIAL SOIL(MOST FERTILE)",
      "LATERITE SOIL",
    ],
  }),
  detail("waterSources", "Water source", "text", {
    when: land,
    maxLength: 255,
  }),
  detail("existingPlantation", "Existing crops or plantation", "text", {
    when: is("farmland"),
    maxLength: 255,
  }),
  detail("fencing", "Fencing", "text", {
    when: is("farmland"),
    maxLength: 255,
  }),
  detail("boreWell", "Bore well", "checkbox", { when: is("farmland") }),
  detail("propertyUse", "Suitable business use", "text", {
    when: is("commercial", "industrial"),
    maxLength: 100,
    placeholder: "e.g. Office, showroom or warehouse",
  }),
  count("noOfLifts", "Lifts", is("commercial")),
  count("sharedWashrooms", "Shared washrooms", is("commercial")),
  count("individualWashrooms", "Private washrooms", is("commercial")),
  detail("hasPantry", "Pantry", "checkbox", {
    when: is("commercial", "coworking"),
  }),
  detail("fireSafety", "Fire safety equipment", "checkbox", {
    when: is("commercial", "industrial"),
  }),
  detail("ceilingHeightFt", "Ceiling height (ft)", "number", {
    when: is("commercial", "industrial"),
    min: 1,
  }),
  detail("coveredArea", "Covered area (sq ft)", "number", {
    when: is("industrial"),
    min: 1,
  }),
  detail("openArea", "Open area (sq ft)", "number", {
    when: is("industrial"),
    min: 0,
  }),
  detail("powerSupplyHp", "Power supply (HP)", "number", {
    when: is("industrial"),
    min: 0,
  }),
  count("truckParking", "Truck parking spaces", is("industrial")),
  detail("heavyVehicleAccess", "Heavy vehicle access", "checkbox", {
    when: is("industrial"),
  }),
  detail("craneAvailable", "Crane available", "checkbox", {
    when: is("industrial"),
  }),
  {
    ...count(
      "availableWorkstations",
      "Available workstations",
      is("coworking"),
      true,
    ),
    min: 1,
  },
  count("minSeats", "Minimum seats", is("coworking")),
  count("privateCabins", "Private cabins", is("coworking")),
  count("meetingRooms", "Meeting rooms", is("coworking")),
  detail("rentPerSeat", "Rent per seat (₹ / month)", "number", {
    when: (d) => is("coworking")(d) && rent(d),
    min: 1,
  }),
  detail("highSpeedWifi", "High speed WiFi", "checkbox", {
    when: is("coworking"),
  }),
  detail("airConditioning", "Air conditioning", "checkbox", {
    when: is("coworking"),
  }),
  detail("hasRestroom", "Restroom", "checkbox", {
    when: is("industrial", "commercial", "coworking"),
  }),
  {
    key: "price",
    label: "Expected sale price (₹)",
    kind: "number",
    scope: "top",
    step: 3,
    required: true,
    min: 1,
    max: 9999999999.99,
  },
  {
    key: "negotiable",
    label: "The price is negotiable",
    kind: "checkbox",
    scope: "top",
    step: 3,
  },
  {
    key: "bookingAmount",
    label: "Booking amount (₹)",
    kind: "number",
    scope: "top",
    step: 3,
    when: sale,
    min: 0,
    max: 9999999999.99,
  },
  {
    key: "transactionType",
    label: "Sale type",
    kind: "select",
    scope: "top",
    step: 3,
    when: (d) => sale(d) && building(d),
    options: [
      "New",
      "Resale Unoccupied",
      "Resale Occupied",
      "Resale Tenant Occupied",
    ],
  },
  {
    key: "ownershipType",
    label: "Ownership",
    kind: "select",
    scope: "top",
    step: 3,
    when: sale,
    options: [
      "Freehold",
      "Leasehold",
      "Power of Attorney",
      "Cooperative Society",
    ],
  },
  {
    key: "reraNumber",
    label: "RERA number",
    kind: "text",
    scope: "top",
    step: 3,
    when: sale,
    maxLength: 255,
    hint: "Optional at this stage. Our team checks registration details.",
  },
  {
    key: "securityDeposit",
    label: "Security deposit (₹)",
    kind: "number",
    scope: "top",
    step: 3,
    when: rent,
    min: 0,
    max: 9999999999.99,
  },
  {
    key: "maintenanceCharges",
    label: "Monthly maintenance (₹)",
    kind: "number",
    scope: "top",
    step: 3,
    when: building,
    min: 0,
    max: 9999999999.99,
  },
  {
    key: "availableFrom",
    label: "Available from",
    kind: "date",
    scope: "top",
    step: 3,
    when: rent,
  },
  {
    key: "lockInPeriod",
    label: "Minimum rental term",
    kind: "select",
    scope: "top",
    step: 3,
    when: rent,
    options: ["No lock in", "6 Months", "1 Year", "3 Years", "5 Years"],
  },
];
export const emptyDraft = (): OwnerDraft => ({
  version: 2,
  category: "",
  listingType: "Sell",
  cityId: "",
  sublocationId: "",
  values: {},
  amenityIds: [],
  furnishingIds: [],
  photos: [],
});
export function visibleFields(draft: OwnerDraft, step?: number): Field[] {
  return FIELDS.filter(
    (f) =>
      (step === undefined || f.step === step) && (!f.when || f.when(draft)),
  ).map((f) =>
    f.key === "price" && draft.listingType === "Rent"
      ? { ...f, label: "Monthly rent (₹)" }
      : f,
  );
}
export function cleanDraft(draft: OwnerDraft): OwnerDraft {
  const category =
    draft.listingType === "Rent" && draft.category === "farmland"
      ? ""
      : draft.category;
  const next = { ...draft, category };
  const keys = new Set(visibleFields(next).map((f) => f.key));
  // areaUnit is draft metadata for the shared areaSqft input. Older drafts
  // did not have it and therefore continue to mean square feet.
  if (land(next)) keys.add("areaUnit");
  // Keep this legacy draft value until submission, but never expose a second
  // editable total-area field. The payload derives it from the single area.
  if (land(next)) keys.add("plotSizeCents");
  const values = Object.fromEntries(
    Object.entries(next.values).filter(([key]) => keys.has(key)),
  );
  if (land(next) && values.areaUnit !== undefined)
    values.areaUnit = normalizeAreaUnit(values.areaUnit);
  const furnished = ["SEMI FURNISHED", "FULLY FURNISHED"].includes(
    String(values.furnishingStatus),
  );
  return {
    ...next,
    values,
    amenityIds: land(next) ? [] : next.amenityIds,
    furnishingIds: furnished ? next.furnishingIds : [],
  };
}
// Drafts are untrusted persisted data; tolerate the earlier partial wizard's shape.
export function restoreDraft(input: unknown): OwnerDraft | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const draft = emptyDraft();
  draft.category = CATEGORIES.some((c) => c.value === raw.category)
    ? (raw.category as Category)
    : "";
  draft.listingType = raw.listingType === "Rent" ? "Rent" : "Sell";
  draft.cityId = String(raw.cityId ?? "");
  draft.sublocationId = String(raw.sublocationId ?? "");
  const legacy = {
    ...((raw.details as object) ?? {}),
    ...Object.fromEntries(
      ["title", "description", "price", "ownershipType", "reraNumber"].map(
        (k) => [k, raw[k]],
      ),
    ),
  };
  const values = raw.version === 2 ? raw.values : legacy;
  if (values && typeof values === "object")
    draft.values = Object.fromEntries(
      Object.entries(values)
        .filter(
          ([, v]) =>
            typeof v === "string" ||
            typeof v === "boolean" ||
            typeof v === "number",
        )
        .map(([k, v]) => [
          k,
          typeof v === "number" ? String(v) : (v as FieldValue),
        ]),
    );
  for (const key of ["amenityIds", "furnishingIds"] as const)
    draft[key] = Array.isArray(raw[key])
      ? (raw[key] as unknown[])
          .filter(
            (n): n is number =>
              typeof n === "number" && Number.isInteger(n) && n > 0,
          )
          .slice(0, 50)
      : [];
  const photos = raw.photos ?? raw.files;
  if (Array.isArray(photos))
    draft.photos = photos
      .filter(
        (p) => p && typeof p.key === "string" && typeof p.name === "string",
      )
      .slice(0, 20)
      .map((p) => ({
        key: p.key,
        name: p.name,
        previewUrl:
          typeof p.previewUrl === "string" && /^https?:\/\//.test(p.previewUrl)
            ? p.previewUrl
            : undefined,
      }));
  return cleanDraft(draft);
}
export function hasProgress(d: OwnerDraft): boolean {
  return (
    !!d.category ||
    !!d.cityId ||
    Object.values(d.values).some((v) => v !== "" && v !== false) ||
    d.photos.length > 0
  );
}
export function validateStep(
  d: OwnerDraft,
  step: number,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 0 && !d.category)
    errors.category = "Choose a property category to continue.";
  if (step === 1) {
    if (!d.cityId) errors.cityId = "Choose a city.";
    if (!d.sublocationId)
      errors.sublocationId = "Choose a locality in this city.";
  }
  for (const f of visibleFields(d, step)) {
    const value = d.values[f.key];
    const text = String(value ?? "").trim();
    const minimum = f.key === "areaSqft" && land(d) ? 0.00000001 : (f.min ?? 0);
    if (f.required && !text) errors[f.key] = `Enter ${f.label.toLowerCase()}.`;
    else if (
      text &&
      f.kind === "number" &&
      (!Number.isFinite(Number(text)) ||
        Number(text) < minimum ||
        Number(text) > (f.max ?? 9999999999) ||
        (f.integer && !Number.isInteger(Number(text))) ||
        (!f.integer &&
          !(f.key === "areaSqft" && land(d)
            ? areaAmountIsValid(text)
            : /^\d+(\.\d{1,4})?$/.test(text))))
    )
      errors[f.key] =
        `Enter a valid ${f.integer ? "whole number" : "amount"}${minimum ? ` of at least ${minimum}` : ""}.`;
    else if (text && f.maxLength && text.length > f.maxLength)
      errors[f.key] = `Use ${f.maxLength} characters or fewer.`;
    else if (text && f.options && !f.options.includes(text))
      errors[f.key] = "Choose an option from the list.";
  }
  if (step === 2 && land(d) && d.values.areaSqft) {
    const amount = Number(d.values.areaSqft);
    const canonical = areaToSqft(amount, normalizeAreaUnit(d.values.areaUnit));
    if (Number.isFinite(canonical) && (canonical < 1 || canonical > 9999999999))
      errors.areaSqft = "Enter a total land area between 1 and 9,999,999,999 sq ft.";
  }
  if (
    step === 1 &&
    d.values.pincode &&
    !/^\d{6}$/.test(String(d.values.pincode))
  )
    errors.pincode = "Enter a 6 digit PIN code.";
  if (step === 2 && residential(d) && Number(d.values.bedrooms) < 1)
    errors.bedrooms = "Enter at least one bedroom.";
  if (
    step === 2 &&
    d.values.carpetArea &&
    Number(d.values.carpetArea) >
      Number(d.values.buildUpArea || d.values.areaSqft)
  )
    errors.carpetArea = "Carpet area cannot exceed the built up area.";
  if (
    step === 2 &&
    d.values.floorNumber &&
    /^\d+$/.test(String(d.values.floorNumber)) &&
    d.values.totalFloors &&
    Number(d.values.floorNumber) > Number(d.values.totalFloors)
  )
    errors.floorNumber = "Floor number cannot exceed the total floors.";
  if (
    step === 3 &&
    d.values.price &&
    !/^\d+(\.\d{1,2})?$/.test(String(d.values.price))
  )
    errors.price = "Use a rupee amount with at most 2 decimal places.";
  return errors;
}
export function buildPayload(draft: OwnerDraft) {
  const d = cleanDraft(draft);
  const top: Record<string, unknown> = {};
  const details: Record<string, unknown> = {};
  const location: Record<string, unknown> = {};
  for (const f of visibleFields(d)) {
    const value = d.values[f.key];
    if (value === undefined || value === "") continue;
    const converted =
      f.scope === "details" && f.kind === "number"
        ? Number(value)
        : typeof value === "string"
          ? value.trim()
          : value;
    (f.scope === "top" ? top : f.scope === "location" ? location : details)[
      f.key
    ] = converted;
  }
  if (land(d)) {
    const amount = Number(d.values.areaSqft);
    if (d.values.areaSqft !== undefined && d.values.areaSqft !== "" && Number.isFinite(amount)) {
      const unit = normalizeAreaUnit(d.values.areaUnit);
      const canonicalSqft = areaToSqft(amount, unit);
      details.areaSqft = canonicalSqft;
      details.plotArea = amount;
      details.areaUnit = unit;
      details.plotSizeCents =
        Math.round((canonicalSqft / CENT_TO_SQFT) * 1e10) / 1e10;
    }
  }
  if (residential(d) && details.bedrooms)
    details.unitType = `${details.bedrooms}BHK`;
  if (details.furnishingStatus)
    details.furnished = details.furnishingStatus === "FULLY FURNISHED";
  return {
    ...top,
    listingType: d.listingType,
    cityId: Number(d.cityId),
    sublocationId: Number(d.sublocationId),
    details,
    location,
    amenities: d.amenityIds.map((amenityId) => ({ amenityId })),
    furnishingItems: d.furnishingIds.map((furnishingItemId) => ({
      furnishingItemId,
    })),
    files: d.photos.map((p) => ({ fileKey: p.key })),
  };
}
export function money(value: FieldValue | undefined): string {
  const n = Number(value);
  return value && Number.isFinite(n)
    ? `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)}`
    : "Not specified";
}

export function persistableDraft(draft: OwnerDraft): OwnerDraft {
  return {
    ...draft,
    photos: draft.photos.map(({ key, name, previewUrl }) => ({
      key,
      name,
      previewUrl: previewUrl?.startsWith("blob:") ? undefined : previewUrl,
    })),
  };
}
