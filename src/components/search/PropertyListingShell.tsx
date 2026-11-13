"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingShell } from "./ListingPage";
import { createPropertyAdapter } from "./property-listing-adapter";
import type { FilterValues } from "./PropertySearchFilters";
import type { PropertySearchResponse } from "@/lib/api";
import { useLocationContext } from "@/contexts/LocationContext";
import {
  PROPERTY_TYPES,
  buildPseoSlug,
  toLocationSlug,
  type PropertyTypeSlug,
} from "@/lib/seo-urls";

type AdapterInit = { initialListingType: "Sell" | "Rent"; initialPropertyType: string; initialCity: string; initialLocality?: string; initialBedrooms?: number };

/**
 * Where a listing page goes when the user picks another city in the navbar:
 * same listing + property type (+ BHK) in the new city, sub-locality dropped
 * (it belongs to the old city), other query filters kept, page reset.
 */
export function cityChangeHref(init: AdapterInit, nextCity: string, search: string): string | null {
  if (!nextCity || toLocationSlug(nextCity) === toLocationSlug(init.initialCity)) return null;
  const ptSlug =
    (Object.entries(PROPERTY_TYPES).find(([, d]) => d.apiValue === init.initialPropertyType)?.[0] as
      | PropertyTypeSlug
      | undefined) ?? "properties";
  const params = new URLSearchParams(search);
  params.delete("page");
  params.delete("location");
  const qs = params.toString();
  const path = "/" + buildPseoSlug(init.initialListingType, ptSlug, nextCity, undefined, init.initialBedrooms);
  return qs ? `${path}?${qs}` : path;
}

export function PropertyListingShell({ adapterInit, initialFilters, initialData }: {
  adapterInit: AdapterInit;
  initialFilters: FilterValues;
  initialData?: PropertySearchResponse | null;
}) {
  const adapter = useMemo(() => createPropertyAdapter(adapterInit),
    [adapterInit.initialListingType, adapterInit.initialPropertyType, adapterInit.initialCity, adapterInit.initialLocality, adapterInit.initialBedrooms]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { adoptCity, isLoadingCities } = useLocationContext();

  // The URL decides the city on a listing page: once the city list has loaded
  // (and the stored city has been restored), adopt the page's city so the
  // navbar and the filter's sub-locality list match the results.
  useEffect(() => {
    if (!isLoadingCities) adoptCity(adapterInit.initialCity);
  }, [isLoadingCities, adoptCity, adapterInit.initialCity]);

  // A navbar pick fires "majestan-location-changed" (adoptCity does not), so
  // a stored city can never bounce a visitor off a shared link.
  const latest = useRef({ adapterInit, search: searchParams.toString() });
  latest.current = { adapterInit, search: searchParams.toString() };
  useEffect(() => {
    const onCityChange = (event: Event) => {
      const nextCity = (event as CustomEvent<string>).detail;
      const href = cityChangeHref(latest.current.adapterInit, nextCity, latest.current.search);
      if (href) router.push(href);
    };
    window.addEventListener("majestan-location-changed", onCityChange);
    return () => window.removeEventListener("majestan-location-changed", onCityChange);
  }, [router]);

  return <ListingShell adapter={adapter} initialFilters={initialFilters} initialData={initialData} />;
}
