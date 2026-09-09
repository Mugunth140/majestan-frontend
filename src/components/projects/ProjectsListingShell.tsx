"use client";

import { ListingShell } from "@/components/search/ListingPage";
import { useLocationContext } from "@/contexts/LocationContext";
import { EMPTY_PROJECT_FILTERS } from "./ProjectFilterPanel";
import { createProjectAdapter } from "./project-listing-adapter";

export function ProjectsListingShell() {
  const { location } = useLocationContext();
  return (
    <ListingShell
      adapter={createProjectAdapter(location)}
      key={location}
      initialFilters={{ ...EMPTY_PROJECT_FILTERS, city: location }}
    />
  );
}
