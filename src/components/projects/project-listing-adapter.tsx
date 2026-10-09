import { X } from "lucide-react";
import { listProjects, type ProjectListItem } from "@/lib/api/projects";
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

    fetchItems: async ({ filters, sort, page }) => {
      // The /projects API has no keyword, sublocation, or sort params, so when
      // any of those are active we fetch a wide window (backend max: 100) and
      // do keyword/sublocation filtering, sorting, and pagination client-side
      // over the full set. Plain browsing stays server-paginated (limit 12).
      // filters.city holds either the base city or a picked sublocation —
      // the API only understands the base city, so sublocations filter locally.
      const keyword = filters.keyword.trim().toLowerCase();
      const requested = (filters.city || city).trim();
      const isBaseCity =
        requested === "" || requested.toLowerCase() === city.trim().toLowerCase();
      const sublocationFilter = isBaseCity ? "" : requested.toLowerCase();
      const minArea = filters.minArea ? Number(filters.minArea) : undefined;
      const maxArea = filters.maxArea ? Number(filters.maxArea) : undefined;
      const hasArea = (minArea != null && !isNaN(minArea)) || (maxArea != null && !isNaN(maxArea));
      const wide = keyword !== "" || sort !== "" || sublocationFilter !== "" || hasArea || filters.possession !== "" || filters.reraVerified !== "";
      const res = await listProjects({
        city: city || undefined,
        projectType: filters.projectType || undefined,
        bhk: filters.bhk ? Number(filters.bhk) : undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        possession: filters.possession || undefined,
        rera: filters.reraVerified === "1" ? true : undefined,
        page: wide ? 1 : page,
        limit: wide ? 100 : 12,
      });
      let items = res.items;
      if (hasArea) {
        items = items.filter((item) => {
          const lo = item.ranges.minArea ?? item.ranges.maxArea ?? null;
          const hi = item.ranges.maxArea ?? item.ranges.minArea ?? null;
          if (lo == null || hi == null) return false;
          if (minArea != null && !isNaN(minArea) && hi < minArea) return false;
          if (maxArea != null && !isNaN(maxArea) && lo > maxArea) return false;
          return true;
        });
      }
      if (sublocationFilter) {
        items = items.filter((item) =>
          [item.sublocation, item.city].some((field) =>
            field?.toLowerCase().includes(sublocationFilter)
          )
        );
      }
      if (keyword) {
        items = items.filter((item) =>
          [item.name, item.builderName, item.sublocation, item.city].some((field) =>
            field?.toLowerCase().includes(keyword)
          )
        );
      }
      if (sort === "low_to_high") items = [...items].sort((a, b) => (a.ranges.minPrice ?? Infinity) - (b.ranges.minPrice ?? Infinity));
      if (sort === "high_to_low") items = [...items].sort((a, b) => (b.ranges.maxPrice ?? -Infinity) - (a.ranges.maxPrice ?? -Infinity));
      if (sort === "Area_low_to_high") items = [...items].sort((a, b) => (a.ranges.minArea ?? Infinity) - (b.ranges.minArea ?? Infinity));
      if (sort === "Area_high_to_low") items = [...items].sort((a, b) => (b.ranges.maxArea ?? -Infinity) - (a.ranges.maxArea ?? -Infinity));
      if (sort === "newest") items = [...items].sort((a, b) => b.id - a.id);
      if (!wide) return { items, total: res.total, limit: 12 };
      const total = items.length;
      const start = (page - 1) * 12;
      return { items: items.slice(start, start + 12), total, limit: 12 };
    },

    getItemKey: (item) => item.id,

    renderCard: (item) => <ProjectListingCard key={item.id} item={item} />,

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
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                &ldquo;{filters.keyword}&rdquo;
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, keyword: "" })} />
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Price: {filters.minPrice ? `₹${Number(filters.minPrice) / 100000}L+` : '0'} to {filters.maxPrice ? `₹${Number(filters.maxPrice) / 100000}L` : 'Any'}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, minPrice: "", maxPrice: "" })} />
              </span>
            )}
            {filters.bhk && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                {filters.bhk} BHK
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, bhk: "" })} />
              </span>
            )}
            {(filters.minArea || filters.maxArea) && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Area: {filters.minArea || "0"} to {filters.maxArea || "Any"} sq.ft
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, minArea: "", maxArea: "" })} />
              </span>
            )}
            {filters.possession && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                {POSSESSION_LABELS[filters.possession] ?? filters.possession}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({ ...filters, possession: "" })} />
              </span>
            )}
            {filters.reraVerified && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
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
