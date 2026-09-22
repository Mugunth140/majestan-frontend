import { X } from "lucide-react";
import { listProjects, type ProjectListItem } from "@/lib/api/projects";
import { ProjectFilterPanel, EMPTY_PROJECT_FILTERS, type ProjectFilterValues } from "./ProjectFilterPanel";
import { ProjectListingCard } from "./ProjectListingCard";
import { ProjectsMap } from "./ProjectsMap";
import type { ListingAdapter } from "../search/listing-adapter";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "low_to_high", label: "Price: Low to High" },
  { value: "high_to_low", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

export function createProjectAdapter(city: string): ListingAdapter<ProjectFilterValues, ProjectListItem> {
  return {
    limit: 12,
    sortOptions: SORT_OPTIONS,
    resetFilters: { ...EMPTY_PROJECT_FILTERS, city },

    fetchItems: async ({ filters, sort, page }) => {
      // The /projects API has no keyword or sort params, so when either is
      // active we fetch a wide window (backend max: 100) and do keyword
      // filtering, sorting, and pagination client-side over the full set.
      // Plain browsing stays server-paginated (limit 12).
      const keyword = filters.keyword.trim().toLowerCase();
      const wide = keyword !== "" || sort !== "";
      const res = await listProjects({
        city: filters.city || undefined,
        projectType: filters.projectType || undefined,
        bhk: filters.bhk ? Number(filters.bhk) : undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        page: wide ? 1 : page,
        limit: wide ? 100 : 12,
      });
      let items = res.items;
      if (keyword) {
        items = items.filter((item) =>
          [item.name, item.builderName, item.sublocation, item.city].some((field) =>
            field?.toLowerCase().includes(keyword)
          )
        );
      }
      if (sort === "low_to_high") items = [...items].sort((a, b) => (a.ranges.minPrice ?? Infinity) - (b.ranges.minPrice ?? Infinity));
      if (sort === "high_to_low") items = [...items].sort((a, b) => (b.ranges.maxPrice ?? -Infinity) - (a.ranges.maxPrice ?? -Infinity));
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
      if (!(filters.keyword || filters.minPrice || filters.maxPrice || filters.bhk)) return null;
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
          </div>
        </div>
      );
    },

    renderRightRail: (filters, items) => (
      <ProjectsMap items={items ?? []} city={filters.city || "Coimbatore"} />
    ),

    buildTitle: (filters) => `New Villa & Apartment Projects in ${filters.city}`,

    buildBreadcrumbs: () => [{ label: "Projects" }],

    mapCity: (f) => f.city || "Coimbatore",

    emptyTitle: "No projects found",
    emptyHint: () => "Try adjusting your filters.",

    syncUrl: ({ filters, sort, pathname, searchParams }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (sort) params.set("sort", sort);
      else params.delete("sort");
      
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

      params.delete("page");
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },

    filtersFromParams: (searchParams) => ({
      city: city, // from outer scope (the `city` argument passed to `createProjectAdapter`)
      keyword: searchParams.get("keyword") || "",
      projectType: searchParams.get("projectType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bhk: searchParams.get("bhk") || "",
    }),
  };
}
