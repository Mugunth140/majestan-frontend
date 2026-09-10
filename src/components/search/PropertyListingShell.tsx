"use client";

import { useMemo } from "react";
import { ListingShell } from "./ListingPage";
import { createPropertyAdapter } from "./property-listing-adapter";
import type { FilterValues } from "./PropertySearchFilters";
import type { PropertySearchResponse } from "@/lib/api";

export function PropertyListingShell({ adapterInit, initialFilters, initialData }: {
  adapterInit: { initialListingType: "Sell" | "Rent"; initialPropertyType: string; initialCity: string; initialLocality?: string; initialBedrooms?: number };
  initialFilters: FilterValues;
  initialData?: PropertySearchResponse | null;
}) {
  const adapter = useMemo(() => createPropertyAdapter(adapterInit),
    [adapterInit.initialListingType, adapterInit.initialPropertyType, adapterInit.initialCity, adapterInit.initialLocality, adapterInit.initialBedrooms]);
  return <ListingShell adapter={adapter} initialFilters={initialFilters} initialData={initialData} />;
}
