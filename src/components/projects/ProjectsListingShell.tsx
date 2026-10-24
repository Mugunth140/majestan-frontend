"use client";

import { ListingShell } from "@/components/search/ListingPage";
import { useLocationContext } from "@/contexts/LocationContext";
import { EMPTY_PROJECT_FILTERS } from "./ProjectFilterPanel";
import { createProjectAdapter } from "./project-listing-adapter";

export function ProjectsListingShell({ initialData, initialFilters }: { initialData?: import("@/components/search/listing-adapter").ListingPageData<import("@/lib/api/projects").ProjectListItem>; initialFilters?: import("@/lib/project-listing-data").ProjectFilterValues }) {
  const { location } = useLocationContext();
  return (
    <ListingShell
      adapter={createProjectAdapter(location)}
      key={location}
      initialFilters={location === "Coimbatore" && initialFilters ? initialFilters : { ...EMPTY_PROJECT_FILTERS, city: location }}
      initialData={location === "Coimbatore" ? initialData : undefined}
    />
  );
}
