"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListingShell } from "@/components/search/ListingPage";
import { useLocationContext } from "@/contexts/LocationContext";
import { projectFilters } from "@/lib/project-listing-data";
import { createProjectAdapter } from "./project-listing-adapter";

export function ProjectsListingShell({ initialData, initialFilters }: { initialData?: import("@/components/search/listing-adapter").ListingPageData<import("@/lib/api/projects").ProjectListItem>; initialFilters?: import("@/lib/project-listing-data").ProjectFilterValues }) {
  const { location } = useLocationContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // A navbar city pick makes the old city's sub-locality and page meaningless.
  useEffect(() => {
    const onCityChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.has("location") && !params.has("page")) return;
      params.delete("location");
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    };
    window.addEventListener("majestan-location-changed", onCityChange);
    return () => window.removeEventListener("majestan-location-changed", onCityChange);
  }, [router, pathname]);
  // The server seeds Coimbatore. For any other city, still read the URL's
  // filters (?location=, ?keyword=, ?projectType= from the hero search) —
  // they used to be dropped, showing every project in the city.
  const isSeedCity = location.toLowerCase() === "coimbatore";
  return (
    <ListingShell
      adapter={createProjectAdapter(location)}
      // ListingShell reads URL filters only at mount; remount once the stale
      // ?location= is cleared after a navbar city change.
      key={`${location}|${searchParams.get("location") ?? ""}`}
      initialFilters={isSeedCity && initialFilters ? initialFilters : projectFilters(new URLSearchParams(searchParams.toString()), location)}
      initialData={isSeedCity ? initialData : undefined}
    />
  );
}
