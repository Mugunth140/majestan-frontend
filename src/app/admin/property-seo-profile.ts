export const propertySeoProfiles = {
  apartment: {
    label: "Apartment",
    name: "Garden Apartment",
    focus: "BHK, built-up area, floor layout, parking and shared amenities.",
    floor: "Floor plan",
    amenities: "Apartment amenities",
    photo: "Interiors, exterior and amenities",
  },
  villa: {
    label: "Villa",
    name: "Garden Villa",
    focus:
      "Bedrooms, built-up and plot area, private outdoor space and parking.",
    floor: "Villa floor plan",
    amenities: "Villa features",
    photo: "Interiors, garden and exterior",
  },
  individual_portion: {
    label: "Independent house",
    name: "Garden House",
    focus:
      "Bedrooms, floor layout, built-up and land area, access and parking.",
    floor: "House floor plan",
    amenities: "House features",
    photo: "Interiors, exterior and access",
  },
  plot: {
    label: "Plot",
    name: "Saravanampatti Plot",
    focus:
      "Land area and unit, dimensions, road access and verified approvals. BHK and furnishing do not apply.",
    floor: "Plot layout",
    amenities: "Access & infrastructure",
    photo: "Site, boundaries and approach road",
  },
  farmland: {
    label: "Farmland",
    name: "Green Acres Farmland",
    focus:
      "Land area and unit, access, water source and fencing where recorded. BHK does not apply.",
    floor: "Land layout",
    amenities: "Land features",
    photo: "Land, water source and approach road",
  },
  commercial: {
    label: "Commercial space",
    name: "City Commercial Space",
    focus:
      "Usable area, layout, permitted use, frontage and access where recorded. Avoid residential BHK language.",
    floor: "Space layout",
    amenities: "Business facilities",
    photo: "Workspace, frontage and access",
  },
  industrial: {
    label: "Industrial",
    name: "Industrial Warehouse",
    focus:
      "Site and building area, ceiling height, power, loading access and zoning where recorded.",
    floor: "Site & building layout",
    amenities: "Industrial facilities",
    photo: "Building, loading area and access",
  },
  coworking: {
    label: "Coworking space",
    name: "City Coworking Space",
    focus:
      "Workspace layout, desks or cabins, meeting facilities, connectivity and rental terms where recorded.",
    floor: "Workspace layout",
    amenities: "Workspace facilities",
    photo: "Desks, cabins and shared facilities",
  },
} as const;
export function propertySeoProfile(type: unknown) {
  const key =
    type === "independent_house" ? "individual_portion" : String(type || "");
  return propertySeoProfiles[key as keyof typeof propertySeoProfiles];
}
export function propertySampleVariables(
  type: unknown,
  intent: unknown,
): Record<string, string> {
  const profile = propertySeoProfile(type);
  if (!profile) return {};
  const residential = [
    "apartment",
    "villa",
    "individual_portion",
    "independent_house",
  ].includes(String(type));
  return {
    Property_Name: profile.name,
    Property_Type: profile.label,
    BHK: residential ? "3 BHK" : "",
    Project_Name: profile.name,
    Transaction_Type: intent === "rent" ? "Rent" : "Sale",
    Price: intent === "rent" ? "₹35,000/month" : "₹89 Lakh",
  };
}
