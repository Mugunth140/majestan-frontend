"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { MapPlaceholder } from "./MapPlaceholder";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import type { ListingAdapter, ListingPageData } from "./listing-adapter";

export function ListingShell<TFilters extends Record<string, string>, TItem>({
  adapter,
  initialFilters,
  initialData,
}: {
  adapter: ListingAdapter<TFilters, TItem>;
  initialFilters: TFilters;
  initialData?: ListingPageData<TItem> | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [data, setData] = useState<ListingPageData<TItem> | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "";

  const [filters, setFilters] = useState<TFilters>({...initialFilters, ...adapter.filtersFromParams(searchParams) as TFilters});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adapter.fetchItems({ filters, sort, page });
      setData(res);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [adapter, filters, page, sort]);

  // Initial load or query param changes
  useEffect(() => {
    if (!initialData || searchParams.toString() !== "") {
      loadData();
    }
  }, [loadData, searchParams]);

  const handleFilterChange = (newFilters: TFilters) => {
    setFilters(newFilters);
    router.push(adapter.syncUrl({ filters: newFilters, sort, pathname, searchParams }));
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) params.set("sort", newSort);
    else params.delete("sort");
    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const pageTitle = adapter.buildTitle(filters);
  const breadcrumbItems = adapter.buildBreadcrumbs(filters);

  return (
    <div className="min-h-screen! pb-12! mt-20! md:mt-24!">
      <div className="container! mx-auto! px-4! py-8!">
        <div className="flex! flex-col! lg:flex-row! gap-8!">

          {/* Left Sidebar */}
          <aside className={`${showFilters ? 'block!' : 'hidden! lg:block!'} w-full! lg:w-[320px]! xl:w-[360px]! shrink-0! space-y-5!`}>

            {/* Breadcrumbs — bare on the background */}
            <div className="px-1!">
              <Breadcrumbs items={breadcrumbItems} jsonLd />
            </div>

            {/* Filters Component — no scroll */}
            {adapter.renderFilters({
              values: filters,
              onChange: handleFilterChange,
              onReset: () => {
                handleFilterChange(adapter.resetFilters);
              }
            })}


            {/* Active Filters */}
            {adapter.renderActiveChips(filters, handleFilterChange)}

            {/* Map at the bottom */}
            <div className="h-[280px]! rounded-2xl! overflow-hidden! shadow-sm! border! border-gray-200/60!">
              <MapPlaceholder city={adapter.mapCity(filters)} locality={adapter.mapLocality?.(filters)} />
            </div>
          </aside>

          {/* Main Content: Properties List */}
          <main className="flex-1! flex! flex-col! gap-6!">

            {/* Header: Title + Sort */}
            <div className="flex! flex-col! lg:flex-row! items-start! lg:items-center! justify-between! gap-4! pb-4! border-b! border-gray-200/60!">
              <div className="flex-1! min-w-0!">
                <div className="flex! items-center! gap-2! mb-1.5!">
                  <span className="text-sm! font-bold! text-[#27427f]! py-1!">{data?.total || 0} Results</span>
                </div>
                <h1 className="text-xl! lg:text-2xl! font-semibold! capitalize! text-gray-900! font-['Lexend',sans-serif]! leading-snug!">
                  {pageTitle}
                </h1>
              </div>
              <div className="relative! shrink-0! w-full! lg:w-auto!">
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  style={{ appearance: 'none', WebkitAppearance: 'none' }}
                  className="w-full! lg:w-auto! block! bg-white! border! border-gray-200! rounded-xl! pl-4! pr-10! py-2.5! text-sm! font-bold! text-gray-700! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! cursor-pointer! shadow-sm!"
                >
                  {adapter.sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ArrowUpDown className="absolute! right-3.5! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-500! pointer-events-none!" />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden! flex! justify-between! items-center! bg-white! p-4! rounded-2xl! shadow-sm! border! border-gray-100/60!">
              <span className="font-bold! text-gray-900!">{data?.total || 0} Results</span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex! items-center! gap-2! px-5! py-2.5! rounded-xl! text-sm! font-bold! transition-all! ${
                  showFilters ? 'bg-[#27427f]! text-white! shadow-md!' : 'bg-gray-50! text-gray-700! hover:bg-gray-100!'
                }`}
              >
                <SlidersHorizontal className="w-4! h-4!" />
                Filters
              </button>
            </div>

            {loading ? (
              <div className="flex! flex-col! gap-6!">
                {[1, 2, 3, 4].map(i => (
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
                <button onClick={() => loadData()} className="mt-4! px-6! py-2! bg-red-100! text-red-700! rounded-lg! text-sm! font-bold! hover:bg-red-200! transition-colors!">Try Again</button>
              </div>
            ) : data?.items.length === 0 ? (
              <div className="bg-white! rounded-2xl! border! border-gray-100/60! p-16! text-center! flex! flex-col! items-center! shadow-sm!">
                <div className="w-24! h-24! bg-gray-50! rounded-full! flex! items-center! justify-center! mb-6!">
                  <Search className="w-10! h-10! text-gray-400!" />
                </div>
                <h3 className="text-2xl! font-extrabold! text-gray-900! mb-3! font-['Lexend',sans-serif]!">{adapter.emptyTitle}</h3>
                <p className="text-gray-500! max-w-md! mb-8!">{adapter.emptyHint(filters)}</p>
                <button
                  onClick={() => handleFilterChange(adapter.resetFilters)}
                  className="px-8! py-3! bg-[#27427f]! text-white! rounded-xl! font-bold! hover:bg-[#1d3261]! hover:shadow-lg! hover:-translate-y-0.5! transition-all!"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex! flex-col! gap-6!">
                  {data?.items.map(item => adapter.renderCard(item))}
                </div>

                {/* Pagination */}
                {data && data.total > data.limit && (() => {
                  const totalPages = Math.ceil(data.total / data.limit);
                  const prevParams = new URLSearchParams(searchParams.toString());
                  prevParams.set("page", String(page - 1));
                  const nextParams = new URLSearchParams(searchParams.toString());
                  nextParams.set("page", String(page + 1));
                  const prevHref = page > 1 ? `${pathname}?${prevParams.toString()}` : null;
                  const nextHref = page < totalPages ? `${pathname}?${nextParams.toString()}` : null;
                  return (
                  <div className="flex! justify-center! mt-12!">
                    <div className="inline-flex! bg-white! rounded-2xl! shadow-sm! border! border-gray-100/60! p-1.5!">
                      {prevHref ? (
                        <Link href={prevHref} prefetch className="p-2.5! rounded-xl! text-gray-500! hover:bg-gray-50! transition-colors!">
                          <ChevronLeft className="w-5! h-5!" />
                        </Link>
                      ) : (
                        <span className="p-2.5! rounded-xl! text-gray-400! opacity-40!">
                          <ChevronLeft className="w-5! h-5!" />
                        </span>
                      )}
                      <div className="flex! items-center! px-6! text-sm! font-bold! text-gray-700!">
                        Page {page} of {totalPages}
                      </div>
                      {nextHref ? (
                        <Link href={nextHref} prefetch className="p-2.5! rounded-xl! text-gray-500! hover:bg-gray-50! transition-colors!">
                          <ChevronRight className="w-5! h-5!" />
                        </Link>
                      ) : (
                        <span className="p-2.5! rounded-xl! text-gray-400! opacity-40!">
                          <ChevronRight className="w-5! h-5!" />
                        </span>
                      )}
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
