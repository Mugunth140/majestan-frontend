import { fetchProjectListing } from "@/lib/project-listing-data";
import { X } from "lucide-react";
import { type ProjectListItem } from "@/lib/api/projects";
import { ProjectFilterPanel, EMPTY_PROJECT_FILTERS, type ProjectFilterValues } from "./ProjectFilterPanel";
import { ProjectListingCard } from "./ProjectListingCard";
import type { ListingAdapter } from "../search/listing-adapter";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "low_to_high", label: "Price: Low to High" },
  { value: "high_to_low", label: "Price: High to Low" },
  { value: "Area_low_to_high", label: "Area: Small to Large" },
  { value: "Area_high_to_low", label: "Area: Large to Small" },
  { value: "newest", label: "Newest" },
];

export function createProjectAdapter(city: string): ListingAdapter<ProjectFilterValues, ProjectListItem> {
  return {
    limit: 12,
    sortOptions: SORT_OPTIONS,
    resetFilters: { ...EMPTY_PROJECT_FILTERS, city },

    fetchItems: ({ filters, sort, page }) => fetchProjectListing(city, filters, sort, page),

    getItemKey: (item) => item.id,

    renderCard: (item) => <ProjectListingCard key={item.id} item={item} />,
    adAudience: () => "projects",

    renderFilters: ({ values, onChange, onReset }) => (
      <ProjectFilterPanel values={values} onChange={onChange} onReset={onReset} />
    ),

    renderActiveChips: (filters, onChange) => {
      const POSSESSION_LABELS: Record<string, string> = { ready_to_move: "Ready to Move", under_construction: "Under Construction", new_launch: "New Launch" };
      if (!(filters.keyword || filters.minPrice || filters.maxPrice || filters.bhk || filters.minArea || filters.maxArea || filters.possession || filters.reraVerified)) return null;
      return (
        <div className="bg-white! rounded-2xl! shadow-sm! border! border-gray-200/60! p-5!">
          <h3 className="text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-2!">Active Filters</h3>
          <div className="flex! flex-wrap! gap-1.5!">
            {filters.keyword && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#1645bf]/10! text-[#1645bf]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                &ldquo;{filters.keyword}&rdquo;
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, keyword: "" })} />
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#1645bf]/10! text-[#1645bf]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Price: {filters.minPrice ? `₹${Number(filters.minPrice) / 100000}L+` : '0'} to {filters.maxPrice ? `₹${Number(filters.maxPrice) / 100000}L` : 'Any'}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, minPrice: "", maxPrice: "" })} />
              </span>
            )}
            {filters.bhk && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#1645bf]/10! text-[#1645bf]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                {filters.bhk} BHK
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, bhk: "" })} />
              </span>
            )}
            {(filters.minArea || filters.maxArea) && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#1645bf]/10! text-[#1645bf]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Area: {filters.minArea || "0"} to {filters.maxArea || "Any"} sq.ft
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, minArea: "", maxArea: "" })} />
              </span>
            )}
            {filters.possession && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#1645bf]/10! text-[#1645bf]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                {POSSESSION_LABELS[filters.possession] ?? filters.possession}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, possession: "" })} />
              </span>
            )}
            {filters.reraVerified && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#1645bf]/10! text-[#1645bf]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                RERA Verified
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, reraVerified: "" })} />
              </span>
            )}
          </div>
        </div>
      );
    },

    renderRightRail: undefined,

    buildTitle: (filters) => {
      const requested = (filters.city || city).trim();
      const isBaseCity =
        requested === "" || requested.toLowerCase() === city.trim().toLowerCase();
      const locationLabel = isBaseCity ? city : requested;
      const typeLabel = filters.projectType
        ? `New ${filters.projectType.charAt(0).toUpperCase()}${filters.projectType.slice(1)} projects`
        : "New projects";
      return `${typeLabel} in ${locationLabel}`;
    },

    buildBreadcrumbs: (filters) => {
      const requested = (filters.city || city).trim();
      const isBaseCity =
        requested === "" || requested.toLowerCase() === city.trim().toLowerCase();
      return isBaseCity ? [{ label: "Projects" }, { label: city }] : [{ label: "Projects" }, { label: city }, { label: requested }];
    },

    mapCity: (f) => city || f.city || "Coimbatore",
    mapLocality: (f) => {
      const requested = (f.city || city).trim();
      if (requested === "" || requested.toLowerCase() === city.trim().toLowerCase()) return undefined;
      return requested;
    },

    emptyTitle: "No projects found",
    emptyHint: (filters) => {
      const requested = (filters.city || city).trim() || "Coimbatore";
      return `We couldn't find any projects matching your current criteria in ${requested}. Try adjusting your filters or exploring a different area.`;
    },
    countNoun: "result",
    countNounPlural: "results",

    syncUrl: ({ filters, sort, pathname, searchParams }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (sort) params.set("sort", sort);
      else params.delete("sort");

      const requested = (filters.city || city).trim();
      const isBaseCity =
        requested === "" || requested.toLowerCase() === city.trim().toLowerCase();
      if (!isBaseCity) params.set("location", requested);
      else params.delete("location");
      
      if (filters.keyword) params.set("keyword", filters.keyword);
      else params.delete("keyword");

      if (filters.projectType) params.set("projectType", filters.projectType);
      else params.delete("projectType");
      
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      else params.delete("minPrice");
      
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      else params.delete("maxPrice");
      
      if (filters.bhk) params.set("bhk", filters.bhk);
      else params.delete("bhk");

      if (filters.minArea) params.set("minArea", filters.minArea);
      else params.delete("minArea");

      if (filters.maxArea) params.set("maxArea", filters.maxArea);
      else params.delete("maxArea");

      if (filters.possession) params.set("possession", filters.possession);
      else params.delete("possession");

      if (filters.reraVerified) params.set("reraVerified", filters.reraVerified);
      else params.delete("reraVerified");

      params.delete("page");
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },

    filtersFromParams: (searchParams) => ({
      city: searchParams.get("location") || city, // sublocation persists as ?location=; base city otherwise
      keyword: searchParams.get("keyword") || "",
      projectType: searchParams.get("projectType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bhk: searchParams.get("bhk") || "",
      minArea: searchParams.get("minArea") || "",
      maxArea: searchParams.get("maxArea") || "",
      possession: searchParams.get("possession") || "",
      reraVerified: searchParams.get("reraVerified") || "",
    }),
  };
}
