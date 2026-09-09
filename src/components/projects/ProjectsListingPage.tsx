"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { listProjects, type ProjectListResponse } from "@/lib/api/projects";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { MapPlaceholder } from "@/components/search/MapPlaceholder";
import { ProjectFilterPanel, EMPTY_PROJECT_FILTERS, type ProjectFilterValues } from "./ProjectFilterPanel";
import { ProjectListingCard } from "./ProjectListingCard";
import { useLocationContext } from "@/contexts/LocationContext";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "low_to_high", label: "Price: Low to High" },
  { value: "high_to_low", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

const LIMIT = 12;

export function ProjectsListingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { location } = useLocationContext();
  const [filters, setFilters] = useState<ProjectFilterValues>({ ...EMPTY_PROJECT_FILTERS });
  const debounced = useDebouncedValue(filters, 500);
  const [data, setData] = useState<ProjectListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "";

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listProjects({
        city: location || undefined,
        projectType: debounced.projectType || undefined,
        bhk: debounced.bhk ? Number(debounced.bhk) : undefined,
        minPrice: debounced.minPrice ? Number(debounced.minPrice) : undefined,
        maxPrice: debounced.maxPrice ? Number(debounced.maxPrice) : undefined,
        page,
        limit: LIMIT,
      });
      let items = res.items;
      const keyword = debounced.keyword.trim().toLowerCase();
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
      setData({ ...res, items, total: keyword ? items.length : res.total });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [debounced, page, sort, location]);

  useEffect(() => { loadData(); }, [loadData]);

  const pushParams = (patch: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v); else params.delete(k);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSortChange = (v: string) => pushParams({ sort: v });
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  return (
    <div className="min-h-screen! pb-12! mt-20! md:mt-24!">
      <div className="container! mx-auto! px-4! py-8!">
        <div className="flex! flex-col! lg:flex-row! gap-8!">
          <aside className={`${showFilters ? "block!" : "hidden! lg:block!"} w-full! lg:w-[320px]! xl:w-[360px]! shrink-0! space-y-5!`}>
            <div className="px-1!">
              <Breadcrumbs items={[{ label: "Projects" }]} jsonLd />
            </div>
            <ProjectFilterPanel values={filters} onChange={(v) => { setFilters(v); }} onReset={() => { setFilters(EMPTY_PROJECT_FILTERS); router.push(pathname); }} />
            <div className="h-[280px]! rounded-2xl! overflow-hidden! shadow-sm! border! border-gray-200/60!">
              <MapPlaceholder city={location} />
            </div>
          </aside>
          <main className="flex-1! flex! flex-col! gap-6!">
            <div className="flex! flex-col! lg:flex-row! items-start! lg:items-center! justify-between! gap-4! pb-4! border-b! border-gray-200/60!">
              <div className="flex-1! min-w-0!">
                <div className="flex! items-center! gap-2! mb-1.5!">
                  <span className="text-sm! font-bold! text-[#27427f]! py-1!">{data?.total || 0} Results</span>
                </div>
                <h1 className="text-xl! lg:text-2xl! font-semibold! capitalize! text-gray-900! font-['Lexend',sans-serif]! leading-snug!">
                  New Villa & Apartment Projects in {location}
                </h1>
              </div>
              <div className="relative! shrink-0! w-full! lg:w-auto!">
                <select value={sort} onChange={(e) => handleSortChange(e.target.value)} style={{ appearance: "none", WebkitAppearance: "none" }} className="w-full! lg:w-auto! block! bg-white! border! border-gray-200! rounded-xl! pl-4! pr-10! py-2.5! text-sm! font-bold! text-gray-700! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! cursor-pointer! shadow-sm!">
                  {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                <ArrowUpDown className="absolute! right-3.5! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-500! pointer-events-none!" />
              </div>
            </div>
            <div className="lg:hidden! flex! justify-between! items-center! bg-white! p-4! rounded-2xl! shadow-sm! border! border-gray-100/60!">
              <span className="font-bold! text-gray-900!">{data?.total || 0} Results</span>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex! items-center! gap-2! px-5! py-2.5! rounded-xl! text-sm! font-bold! transition-all! cursor-pointer! ${showFilters ? "bg-[#27427f]! text-white! shadow-md!" : "bg-gray-50! text-gray-700! hover:bg-gray-100!"}`}>
                <SlidersHorizontal className="w-4! h-4!" />
                Filters
              </button>
            </div>
            {loading ? (
              <div className="flex! flex-col! gap-6!">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white! rounded-2xl! shadow-sm! border! border-gray-100! p-4! flex! flex-col! md:flex-row! gap-6! animate-pulse!">
                    <div className="w-full! md:w-[340px]! h-[240px]! bg-gray-200! rounded-xl!"></div>
                    <div className="flex-1! space-y-4! py-4!">
                      <div className="h-8! bg-gray-200! rounded! w-3/4!"></div>
                      <div className="h-5! bg-gray-200! rounded! w-1/2!"></div>
                      <div className="pt-6! border-t! border-gray-50! flex! gap-4!">
                        <div className="h-6! bg-gray-200! rounded! w-20!"></div>
                        <div className="h-6! bg-gray-200! rounded! w-20!"></div>
                      </div>
                      <div className="flex! gap-4! pt-4! mt-auto!">
                        <div className="h-12! bg-gray-200! rounded-xl! w-32!"></div>
                        <div className="h-12! bg-gray-200! rounded-xl! w-32!"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50/50! border! border-red-100! rounded-2xl! p-10! text-center!">
                <p className="text-red-600! font-semibold!">{error}</p>
                <button onClick={() => loadData()} className="mt-4! px-6! py-2! bg-red-100! text-red-700! rounded-lg! text-sm! font-bold! hover:bg-red-200! transition-colors! cursor-pointer!">Try Again</button>
              </div>
            ) : data && data.items.length === 0 ? (
              <div className="bg-white! rounded-2xl! border! border-gray-100/60! p-16! text-center! flex! flex-col! items-center! shadow-sm!">
                <div className="w-24! h-24! bg-gray-50! rounded-full! flex! items-center! justify-center! mb-6!">
                  <Search className="w-10! h-10! text-gray-400!" />
                </div>
                <h3 className="text-2xl! font-extrabold! text-gray-900! mb-3! font-['Lexend',sans-serif]!">No projects found</h3>
                <p className="text-gray-500! max-w-md! mb-8!">Try adjusting your filters.</p>
                <button onClick={() => { setFilters(EMPTY_PROJECT_FILTERS); router.push(pathname); }} className="px-8! py-3! bg-[#27427f]! text-white! rounded-xl! font-bold! hover:bg-[#1d3261]! hover:shadow-lg! hover:-translate-y-0.5! transition-all! cursor-pointer!">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex! flex-col! gap-6!">
                  {data?.items.map((item) => (<ProjectListingCard key={item.id} item={item} />))}
                </div>
                {totalPages > 1 && (() => {
                  const prev = new URLSearchParams(searchParams.toString()); prev.set("page", String(page - 1));
                  const next = new URLSearchParams(searchParams.toString()); next.set("page", String(page + 1));
                  return (
                    <div className="flex! justify-center! mt-12!">
                      <div className="inline-flex! bg-white! rounded-2xl! shadow-sm! border! border-gray-100/60! p-1.5!">
                        {page > 1 ? (
                          <Link href={`${pathname}?${prev.toString()}`} prefetch className="p-2.5! rounded-xl! text-gray-500! hover:bg-gray-50! transition-colors!"><ChevronLeft className="w-5! h-5!" /></Link>
                        ) : (<span className="p-2.5! rounded-xl! text-gray-400! opacity-40!"><ChevronLeft className="w-5! h-5!" /></span>)}
                        <div className="flex! items-center! px-6! text-sm! font-bold! text-gray-700!">Page {page} of {totalPages}</div>
                        {page < totalPages ? (
                          <Link href={`${pathname}?${next.toString()}`} prefetch className="p-2.5! rounded-xl! text-gray-500! hover:bg-gray-50! transition-colors!"><ChevronRight className="w-5! h-5!" /></Link>
                        ) : (<span className="p-2.5! rounded-xl! text-gray-400! opacity-40!"><ChevronRight className="w-5! h-5!" /></span>)}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
