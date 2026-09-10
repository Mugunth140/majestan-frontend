"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { MapPlaceholder } from "./MapPlaceholder";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { MobileFilterBar } from "./MobileFilterBar";
import type { ListingAdapter, ListingPageData } from "./listing-adapter";

// ─── helpers ────────────────────────────────────────────────────────────────

function countActiveFilters(filters: Record<string, string>): number {
  const ignoredKeys = new Set(["listingType", "propertyType", "location", "city"]);
  return Object.entries(filters).filter(
    ([k, v]) => !ignoredKeys.has(k) && v !== ""
  ).length;
}

function getLocationLabel(filters: Record<string, string>): string {
  const loc = filters.location || filters.city || "";
  if (!loc) return "All Areas";
  return loc
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getPriceLabel(filters: Record<string, string>): string {
  const min = filters.minPrice;
  const max = filters.maxPrice;
  if (!min && !max) return "Any Price";
  const fmt = (v: string) => {
    const n = Number(v);
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(0)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function getBedsLabel(filters: Record<string, string>): string {
  const b = filters.bedrooms || filters.bhk || "";
  if (!b) return "Any Beds";
  return `${b} BHK`;
}

function getTypeLabel(filters: Record<string, string>): string {
  const t = filters.propertyType || filters.projectType || "";
  if (!t) return "All Types";
  return t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " ");
}

// ─── default right rail ─────────────────────────────────────────────────────

function DefaultRightRail() {
  return (
    <div className="flex! flex-col! gap-4!">
      {/* Enquiry CTA */}
      <div className="bg-[#27427f]! rounded-2xl! p-5! text-white! flex! flex-col! gap-3!">
        <div className="text-[11px]! font-bold! uppercase! tracking-widest! text-white/60!">
          Need help?
        </div>
        <h3 className="font-['Lexend',sans-serif]! text-base! font-bold! leading-snug!">
          Talk to a property expert
        </h3>
        <p className="text-sm! text-white/75! leading-relaxed!">
          Our advisors help you find the right home — at no extra cost.
        </p>
        <a
          href="tel:+914222345678"
          className="flex! items-center! justify-center! gap-2! mt-1! px-4! py-2.5! bg-[#ffc900]! text-[#27427f]! text-sm! font-extrabold! rounded-xl! no-underline! hover:bg-[#ffda4d]! transition-colors!"
        >
          <Phone className="w-4! h-4!" />
          Call Now
        </a>
      </div>

      {/* Why Majestan */}
      <div className="bg-white! rounded-2xl! border! border-gray-100! p-5! flex! flex-col! gap-3!">
        <div className="text-[11px]! font-bold! uppercase! tracking-widest! text-gray-400!">
          Why Majestan
        </div>
        <ul className="flex! flex-col! gap-2.5!">
          {[
            "Verified listings only",
            "Direct builder pricing",
            "Zero brokerage deals",
            "Legal & loan assistance",
          ].map((point) => (
            <li key={point} className="flex! items-start! gap-2! text-sm! text-gray-700!">
              <CheckCircle2 className="w-4! h-4! text-[#27427f]! mt-0.5! shrink-0!" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter / alert */}
      <div className="bg-amber-50! border! border-amber-100! rounded-2xl! p-5! flex! flex-col! gap-3!">
        <div className="text-[11px]! font-bold! uppercase! tracking-widest! text-amber-600!">
          Price Alerts
        </div>
        <p className="text-sm! text-gray-700! leading-relaxed!">
          Get notified when new properties match your search.
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full! text-sm! px-3! py-2! border! border-amber-200! rounded-lg! bg-white! outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]!"
        />
        <button className="w-full! py-2! bg-[#27427f]! text-white! text-sm! font-bold! rounded-lg! cursor-pointer! hover:bg-[#1a2d59]! transition-colors!">
          Notify Me
        </button>
      </div>
    </div>
  );
}

// ─── shell ──────────────────────────────────────────────────────────────────

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

  const [data, setData] = useState<ListingPageData<TItem> | null>(
    initialData || null
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "";

  const [filters, setFilters] = useState<TFilters>({
    ...initialFilters,
    ...(adapter.filtersFromParams(searchParams) as TFilters),
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialData && retryCount === 0) return;
    }
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adapter.fetchItems({ filters, sort, page });
        if (!controller.signal.aborted) setData(res);
      } catch (err: any) {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error ? err.message : "Failed to load listings"
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [adapter, filters, page, sort, initialData, retryCount]);

  // Close drawer when viewport reaches xl
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setShowDrawer(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDrawer]);

  const handleFilterChange = (newFilters: TFilters) => {
    setFilters(newFilters);
    router.push(
      adapter.syncUrl({ filters: newFilters, sort, pathname, searchParams })
    );
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) params.set("sort", newSort);
    else params.delete("sort");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const pageTitle = adapter.buildTitle(filters);
  const breadcrumbItems = adapter.buildBreadcrumbs(filters);
  const activeFilterCount = countActiveFilters(filters);
  const filtersAsRecord = filters as Record<string, string>;

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const prevParams = new URLSearchParams(searchParams.toString());
  prevParams.set("page", String(page - 1));
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.set("page", String(page + 1));
  const prevHref = page > 1 ? `${pathname}?${prevParams}` : null;
  const nextHref = page < totalPages ? `${pathname}?${nextParams}` : null;

  return (
    <div className="min-h-screen! bg-[#f6f7f9]!">
      {/* Header spacer — fixed header is 64px */}
      <div className="h-[64px]!" aria-hidden="true" />

      {/* ── Mobile filter bar ── */}
      <MobileFilterBar
        locationLabel={getLocationLabel(filtersAsRecord)}
        priceLabel={getPriceLabel(filtersAsRecord)}
        bedsLabel={getBedsLabel(filtersAsRecord)}
        typeLabel={getTypeLabel(filtersAsRecord)}
        activeFilterCount={activeFilterCount}
        onOpenDrawer={() => setShowDrawer(true)}
      />

      {/* ── Mobile drawer ── */}
      {showDrawer && (
        <div className="fixed! inset-0! z-50! xl:hidden!">
          {/* overlay */}
          <div
            className="absolute! inset-0! bg-black/40! backdrop-blur-sm!"
            onClick={() => setShowDrawer(false)}
          />
          {/* panel */}
          <div className="absolute! bottom-0! left-0! right-0! bg-white! rounded-t-2xl! max-h-[90vh]! flex! flex-col! overflow-hidden!">
            {/* drag handle */}
            <div className="flex! justify-center! pt-3! pb-1! shrink-0!">
              <div className="w-10! h-1! bg-gray-200! rounded-full!" />
            </div>
            {/* header */}
            <div className="flex! items-center! justify-between! px-5! py-3! border-b! border-gray-100! shrink-0!">
              <h2 className="font-['Lexend',sans-serif]! text-base! font-bold! text-gray-900!">
                Filters
              </h2>
              <div className="flex! items-center! gap-4!">
                <button
                  onClick={() => {
                    handleFilterChange(adapter.resetFilters);
                    setShowDrawer(false);
                  }}
                  className="text-xs! font-bold! text-[#27427f]! uppercase! tracking-wider! cursor-pointer!"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1! rounded-lg! hover:bg-gray-100! transition-colors! cursor-pointer!"
                >
                  <X className="w-5! h-5! text-gray-500!" />
                </button>
              </div>
            </div>
            {/* scrollable filter body */}
            <div className="flex-1! overflow-y-auto! px-4! py-4!">
              {adapter.renderFilters({
                values: filters,
                onChange: handleFilterChange,
                onReset: () => handleFilterChange(adapter.resetFilters),
              })}
            </div>
            {/* sticky footer */}
            <div className="shrink-0! px-4! py-4! border-t! border-gray-100! bg-white!">
              <button
                onClick={() => setShowDrawer(false)}
                className="w-full! py-3! rounded-xl! bg-[#27427f]! text-white! text-sm! font-bold! cursor-pointer! hover:bg-[#1a2d59]! transition-colors!"
              >
                Show {data?.total ?? 0} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page body ── */}
      <div className="max-w-[1400px]! mx-auto! px-4! xl:px-8! pt-6! pb-16!">
        <div className="flex! gap-8! items-start!">

          {/* ── Sidebar (xl+) ── */}
          <aside className="hidden! xl:flex! xl:flex-col! xl:gap-4! w-[300px]! shrink-0! sticky! top-[64px]! max-h-[calc(100vh-64px)]! overflow-y-auto! pt-6! pb-6! pr-1!">
            {adapter.renderFilters({
              values: filters,
              onChange: handleFilterChange,
              onReset: () => handleFilterChange(adapter.resetFilters),
            })}
            {adapter.renderActiveChips(filters, handleFilterChange)}
            <div className="h-[240px]! rounded-2xl! overflow-hidden! shadow-sm! border! border-gray-100! shrink-0!">
              <MapPlaceholder
                city={adapter.mapCity(filters)}
                locality={adapter.mapLocality?.(filters)}
              />
            </div>
          </aside>

          {/* ── Main column ── */}
          <main className="flex-1! min-w-0! flex! flex-col! pt-6!">

            {/* Breadcrumbs */}
            <div className="mb-3!">
              <Breadcrumbs items={breadcrumbItems} jsonLd />
            </div>

            {/* Sticky sub-header */}
            <div className="sticky! top-[64px]! z-20! bg-[#f6f7f9]/95! backdrop-blur-sm! border-b! border-gray-200/60! py-3! mb-5! -mx-4! xl:mx-0! px-4! xl:px-0!">
              <div className="flex! flex-col! sm:flex-row! sm:items-center! sm:justify-between! gap-2!">
                <div className="min-w-0!">
                  <h1 className="font-['Lexend',sans-serif]! text-lg! sm:text-xl! font-bold! text-gray-900! leading-snug! capitalize! truncate!">
                    {pageTitle}
                  </h1>
                  <p className="text-sm! text-gray-500! mt-0.5!">
                    <span className="font-semibold! text-[#27427f]!">
                      {data?.total ?? 0}
                    </span>{" "}
                    properties found
                  </p>
                </div>
                <div className="relative! shrink-0!">
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{ appearance: "none", WebkitAppearance: "none" }}
                    className="block! bg-white! border! border-gray-200! rounded-xl! pl-4! pr-10! py-2! text-sm! font-semibold! text-gray-700! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! cursor-pointer! shadow-sm!"
                  >
                    {adapter.sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute! right-3.5! top-1/2! -translate-y-1/2! w-3.5! h-3.5! text-gray-400! pointer-events-none!" />
                </div>
              </div>
            </div>

            {/* Active chips on mobile */}
            <div className="xl:hidden! mb-4!">
              {adapter.renderActiveChips(filters, handleFilterChange)}
            </div>

            {/* Cards + right rail side-by-side at 2xl */}
            <div className="flex! gap-6! items-start!">

              {/* ── Card feed ── */}
              <div className="flex-1! min-w-0!">
                {/* ── Cards / states ── */}
                {loading ? (
                  <div className="flex! flex-col! gap-3!">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white! rounded-2xl! border! border-gray-100! overflow-hidden! flex! flex-col! xl:flex-row! animate-pulse!"
                      >
                        <div className="w-full! xl:w-[220px]! shrink-0! aspect-[16/10]! xl:aspect-auto! xl:min-h-[180px]! bg-gray-200!" />
                        <div className="p-4! flex! flex-col! gap-2! flex-1!">
                          <div className="h-4! bg-gray-200! rounded! w-3/4!" />
                          <div className="h-3! bg-gray-200! rounded! w-1/2!" />
                          <div className="h-6! bg-gray-200! rounded! w-1/3! mt-1!" />
                          <div className="flex! gap-2! pt-3! mt-auto! border-t! border-gray-100!">
                            <div className="h-7! bg-gray-200! rounded-lg! w-20!" />
                            <div className="h-7! bg-gray-200! rounded-lg! w-24!" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-white! border! border-red-100! rounded-2xl! p-10! text-center!">
                    <p className="text-red-500! font-semibold! mb-4!">{error}</p>
                    <button
                      onClick={() => setRetryCount((c) => c + 1)}
                      className="px-5! py-2! bg-red-50! text-red-600! rounded-lg! text-sm! font-bold! hover:bg-red-100! transition-colors! cursor-pointer!"
                    >
                      Try Again
                    </button>
                  </div>
                ) : data?.items.length === 0 ? (
                  <div className="bg-white! rounded-2xl! border! border-gray-100! p-16! text-center! flex! flex-col! items-center!">
                    <div className="w-20! h-20! bg-gray-50! rounded-full! flex! items-center! justify-center! mb-5!">
                      <Search className="w-8! h-8! text-gray-300!" />
                    </div>
                    <h3 className="font-['Lexend',sans-serif]! text-xl! font-bold! text-gray-900! mb-2!">
                      {adapter.emptyTitle}
                    </h3>
                    <p className="text-gray-500! text-sm! max-w-sm! mb-6!">
                      {adapter.emptyHint(filters)}
                    </p>
                    <button
                      onClick={() => handleFilterChange(adapter.resetFilters)}
                      className="px-6! py-2.5! bg-[#27427f]! text-white! rounded-xl! font-bold! text-sm! hover:bg-[#1a2d59]! transition-colors! cursor-pointer!"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex! flex-col! gap-3!">
                      {data?.items.map((item) => adapter.renderCard(item))}
                    </div>

                    {/* Pagination */}
                    {data && data.total > data.limit && (
                      <div className="flex! items-center! justify-between! mt-8! pt-6! border-t! border-gray-200/60!">
                        {prevHref ? (
                          <Link
                            href={prevHref}
                            prefetch
                            className="flex! items-center! gap-2! px-4! py-2! border! border-gray-200! rounded-lg! text-sm! font-bold! text-gray-600! hover:border-[#27427f]! hover:text-[#27427f]! transition-colors! no-underline!"
                          >
                            <ChevronLeft className="w-4! h-4!" />
                            Previous
                          </Link>
                        ) : (
                          <span className="flex! items-center! gap-2! px-4! py-2! border! border-gray-100! rounded-lg! text-sm! font-bold! text-gray-300!">
                            <ChevronLeft className="w-4! h-4!" />
                            Previous
                          </span>
                        )}
                        <span className="text-sm! text-gray-500!">
                          Page{" "}
                          <span className="font-bold! text-gray-900!">{page}</span>{" "}
                          of{" "}
                          <span className="font-bold! text-gray-900!">
                            {totalPages}
                          </span>
                        </span>
                        {nextHref ? (
                          <Link
                            href={nextHref}
                            prefetch
                            className="flex! items-center! gap-2! px-4! py-2! border! border-gray-200! rounded-lg! text-sm! font-bold! text-gray-600! hover:border-[#27427f]! hover:text-[#27427f]! transition-colors! no-underline!"
                          >
                            Next
                            <ChevronRight className="w-4! h-4!" />
                          </Link>
                        ) : (
                          <span className="flex! items-center! gap-2! px-4! py-2! border! border-gray-100! rounded-lg! text-sm! font-bold! text-gray-300!">
                            Next
                            <ChevronRight className="w-4! h-4!" />
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Right rail (2xl+) ── */}
              <aside className="hidden! 2xl:block! w-[220px]! shrink-0! sticky! top-[64px]! max-h-[calc(100vh-80px)]! overflow-y-auto!">
                {adapter.renderRightRail
                  ? adapter.renderRightRail(filters)
                  : <DefaultRightRail />}
              </aside>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
