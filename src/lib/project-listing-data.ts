import { listProjects } from "./api/projects";
export type ProjectFilterValues = {
  city: string;
  keyword: string;
  projectType: string;
  minPrice: string;
  maxPrice: string;
  bhk: string;
  minArea: string;
  maxArea: string;
  possession: string;
  reraVerified: string;
};

export const EMPTY_PROJECT_FILTERS: ProjectFilterValues = {
  city: "", keyword: "", projectType: "", minPrice: "", maxPrice: "", bhk: "",
  minArea: "", maxArea: "", possession: "", reraVerified: "",
};

export async function fetchProjectListing(city: string, filters: ProjectFilterValues, sort: string, page: number) {
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
    }

export function projectFilters(params: URLSearchParams, city: string): ProjectFilterValues {
  return Object.fromEntries(Object.keys(EMPTY_PROJECT_FILTERS).map(key => [key,
    key === 'city' ? params.get('location') || city : params.get(key) || ''
  ])) as ProjectFilterValues;
}
