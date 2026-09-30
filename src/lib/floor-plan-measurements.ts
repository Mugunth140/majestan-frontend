// site/majestan-frontend/src/lib/floor-plan-measurements.ts
import { Bath, BedDouble, Car, Maximize2, type LucideIcon } from "lucide-react";
import type { SeoPropertyDetails } from "./api/property-by-slug";

export type FloorPlanMeasurement = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export function formatAreaSqft(area: string | null | undefined): string {
  if (!area) return "—";
  const num = parseFloat(area);
  if (isNaN(num)) return area;
  return num.toLocaleString("en-IN");
}

/**
 * The four key measurements shared by the floor-plan sub-page and the
 * overview teaser. One definition so the teaser can never drift from the
 * page it links to.
 */
export function getFloorPlanMeasurements(details: SeoPropertyDetails): FloorPlanMeasurement[] {
  return [
    {
      label: "Total Area",
      value: details?.areaSqft ? `${formatAreaSqft(details.areaSqft)} sq.ft` : "—",
      icon: Maximize2,
    },
    {
      label: "Bedrooms",
      value: details?.bedrooms ? `${details.bedrooms} BHK` : "—",
      icon: BedDouble,
    },
    {
      label: "Bathrooms",
      value: details?.bathrooms ? `${details.bathrooms} Bath` : "—",
      icon: Bath,
    },
    {
      label: "Parking",
      value: details?.parking ? `${details.parking} Covered` : "—",
      icon: Car,
    },
  ];
}
