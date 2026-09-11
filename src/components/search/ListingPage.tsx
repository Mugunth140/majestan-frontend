"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Phone,
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

function EnquireForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! p-5! flex! flex-col! gap-3!">
      {/* <div className="text-[12px]! font-bold! font-['Manrope', sans-serif] tracking-widest! text-gray-800!">
        Enquire Now
      </div> */}
      <h3 className="font-['Manrope',sans-serif]! text-xl! font-medium! text-gray-600! leading-snug! text-center! py-1!">
        Get Details via WhatsApp
      </h3>
      {sent ? (
        <div className="flex! items-start! gap-2! p-1!">
          <p className="text-[12px]! text-blue-950! font-medium! leading-relaxed!">
            Thanks {name.split(" ")[0] || "there"}! Our staff will call you
            shortly.
          </p>
        </div>
      ) : (
        <form
          className="flex! flex-col! gap-2.5!"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && phone.trim()) setSent(true);
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full! h-2.5! p-5! text-sm! placeholder:text-sm! border! border-gray-200! rounded-lg! outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! placeholder:text-gray-400!"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            required
            pattern="[0-9+ ]{10,15}"
            className="w-full! h-2.5! p-5! text-sm! placeholder:text-sm! border! border-gray-200! rounded-lg! outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! placeholder:text-gray-400!"
          />
          <button
            type="submit"
            className="font-['Manrope',sans-serif]! flex! items-center! justify-center! gap-2! w-full! py-2.5! bg-[#27427f]! text-white! text-sm! font-semibold! rounded-xl! cursor-pointer! hover:bg-[#1a2d59]! transition-colors! tracking-wide"
          >
            Request Callback
          </button>
        </form>
      )}
      <a
        href="tel:+914222345678"
        className="font-['Manrope',sans-serif]! flex! items-center! justify-center! gap-2! w-full! py-2.5! border! border-[#27427f]/25! text-[#27427f]! text-sm! font-semibold! rounded-xl! no-underline! hover:bg-[#27427f]/5! transition-colors!"
      >
        <Phone className="w-3.5! h-3.5! fill-blue-800" />
        Call Now
      </a>
    </div>
  );
}

function DefaultRightRail() {
  return (
    <div className="flex! flex-col! gap-4!">
      <EnquireForm />

      {/* Ad card — photo with overlay CTA */}
      <a
        href="tel:+914222345678"
        className="relative! block! rounded-2xl! overflow-hidden! shadow-sm! border! border-gray-100! min-h-[380px]! no-underline! group/ad!"
      >
        <img
          src="/assets/images/banners/banner_1.jpeg"
          alt="Sell your property with Majestan Realty"
          loading="lazy"
          className="absolute! inset-0! w-full! h-full! object-cover! group-hover/ad:scale-105! transition-transform! duration-700! ease-out!"
        />
        <div
          aria-hidden="true"
          className="absolute! inset-0! bg-gradient-to-t! from-[#16294f]! via-[#16294f]/45! to-transparent!"
        />
        <div className="relative! flex! flex-col! justify-end! min-h-[380px]! p-5!">
          <div className="text-[11px]! font-bold! uppercase! tracking-widest! text-[#ffc900]!">
            Majestan Realty
          </div>
          <div className="font-['Lexend',sans-serif]! text-xl! font-extrabold! text-white! leading-snug! mt-1!">
            Selling your property?
          </div>
          <p className="text-[13px]! text-white/85! leading-relaxed! mt-1!">
            List it free and reach thousands of genuine buyers in Coimbatore.
          </p>
          <span className="flex! items-center! justify-center! gap-2! mt-3! px-4! py-2.5! bg-[#ffc900]! text-[#27427f]! text-sm! font-extrabold! rounded-xl! group-hover/ad:bg-[#ffda4d]! transition-colors!">
            <Phone className="w-4! h-4!" />
            Post Property Free
          </span>
        </div>
      </a>
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

  const queryClient = useQueryClient();
  const [showDrawer, setShowDrawer] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "";

  const [filters, setFilters] = useState<TFilters>({
    ...initialFilters,
    ...(adapter.filtersFromParams(searchParams) as TFilters),
  });

  const queryKey = ["listings", pathname, filters, sort, page] as const;
  const {
    data,
    error: queryError,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => adapter.fetchItems({ filters, sort, page }),
    initialData: initialData ?? undefined,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
  const loading = isLoading && !data;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load listings"
    : null;

  // Prefetch the next page in the background for instant "Next" navigation.
  useEffect(() => {
    if (!data) return;
    const totalPages = Math.ceil(data.total / data.limit);
    if (page >= totalPages) return;
    queryClient.prefetchQuery({
      queryKey: ["listings", pathname, filters, sort, page + 1],
      queryFn: () => adapter.fetchItems({ filters, sort, page: page + 1 }),
      staleTime: 60 * 1000,
    });
  }, [queryClient, adapter, pathname, filters, sort, page, data]);

  // Smooth-scroll the feed into view on page change.
  const feedRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef(page);
  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page;
      feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

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
  const pageHref = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNum));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // Compact window: first, last, current ±1, ellipsis elsewhere.
  const pageNumbers: (number | "…")[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const keep = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
    const out: (number | "…")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (!keep.has(i)) {
        if (out[out.length - 1] !== "…") out.push("…");
        continue;
      }
      out.push(i);
    }
    return out;
  })();

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
      <div className="max-w-[1440px]! mx-auto! px-4! xl:px-6! pt-6! pb-16!">
        <div className="flex! gap-6! items-start!">

          {/* ── Sidebar (xl+) ── */}
          <aside className="hidden! xl:flex! xl:flex-col! xl:gap-4! w-[280px]! shrink-0! sticky! top-[64px]! max-h-[calc(100vh-64px)]! overflow-y-auto! pt-6! pb-6! pr-1!">
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
            <div className="">
              <Breadcrumbs items={breadcrumbItems} jsonLd />
            </div>

            {/* Sticky sub-header */}
            <div className="sticky! top-[64px]! z-20! bg-[#f6f7f9]/95! backdrop-blur-sm! border-b! border-gray-200/60! py-3! mb-5! -mx-4! xl:mx-0! px-4! xl:px-0!">
              <div className="flex! flex-col! sm:flex-row! sm:items-center! sm:justify-between! gap-2!">
                <div className="min-w-0!">
                  <h1 className="font-['Manrope',sans-serif]! text-xl! sm:text-2xl! font-semibold! text-gray-900! leading-snug! capitalize! truncate!">
                    {pageTitle}
                  </h1>
                  <p className="text-sm! text-gray-500! mt-0.5!">
                    <span className="font-semibold! text-[#27427f]!">
                      {data?.total ?? 0}
                    </span>{" "}
                    properties found
                    {isFetching && !isLoading && (
                      <span className="ml-2! text-xs! text-gray-400! animate-pulse!">
                        Updating…
                      </span>
                    )}
                  </p>
                </div>
                <div className="relative! shrink-0!">
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{ appearance: "none", WebkitAppearance: "none" }}
                    className="font-['Manrope',sans-serif]! block! bg-[#eef2f7]! border! border-transparent! rounded-full! pl-4! pr-10! py-2.5! text-[13px]! font-semibold! text-[#27427f]! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/25! focus:bg-white! focus:border-[#27427f]/30! hover:bg-[#dde5f0]! transition-all! cursor-pointer!"
                  >
                    {adapter.sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute! right-3.5! top-1/2! -translate-y-1/2! w-3.5! h-3.5! text-[#27427f]! pointer-events-none!" />
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
              <div ref={feedRef} className="flex-1! min-w-0! scroll-mt-[130px]!">
                {/* ── Cards / states ── */}
                {loading ? (
                  <div className="flex! flex-col! gap-3!">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white! rounded-2xl! border! border-gray-100! overflow-hidden! flex! flex-col! xl:flex-row! animate-pulse!"
                      >
                        <div className="w-full! xl:w-[260px]! shrink-0! aspect-[16/10]! xl:aspect-auto! xl:min-h-[230px]! bg-gray-200!" />
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
                      onClick={() => refetch()}
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
                    {data && (
                      <div className="font-['Manrope',sans-serif]! mt-8! pt-6! border-t! border-gray-200/60! flex! flex-col! items-center! gap-3.5!">
                        <p className="text-[13px]! text-gray-500! tabular-nums!">
                          Showing{" "}
                          <span className="font-semibold! text-gray-900!">
                            {data.total === 0
                              ? 0
                              : `${(page - 1) * (data.limit || 12) + 1}–${Math.min(page * (data.limit || 12), data.total)}`}
                          </span>{" "}
                          of{" "}
                          <span className="font-semibold! text-gray-900!">
                            {data.total}
                          </span>{" "}
                          properties
                        </p>
                      <nav
                        aria-label="Listing pages"
                        className="flex! items-center! justify-center! gap-1!"
                      >
                        {page > 1 ? (
                          <Link
                            href={pageHref(page - 1)}
                            prefetch
                            scroll={false}
                            aria-label="Previous page"
                            className="flex! items-center! gap-1! h-9! px-3.5! rounded-full! text-[13px]! font-semibold! text-gray-600! hover:bg-gray-100! hover:text-[#27427f]! transition-colors! no-underline!"
                          >
                            <ChevronLeft className="w-4! h-4!" />
                            <span className="hidden! sm:inline!">Previous</span>
                          </Link>
                        ) : (
                          <span className="flex! items-center! gap-1! h-9! px-3.5! rounded-full! text-[13px]! font-semibold! text-gray-300! cursor-default!">
                            <ChevronLeft className="w-4! h-4!" />
                            <span className="hidden! sm:inline!">Previous</span>
                          </span>
                        )}
                        {pageNumbers.map((p, i) =>
                          p === "…" ? (
                            <span key={`e${i}`} className="w-9! text-center! text-sm! text-gray-400!">
                              …
                            </span>
                          ) : p === page ? (
                            <span
                              key={p}
                              aria-current="page"
                              className="w-9! h-9! flex! items-center! justify-center! rounded-lg! text-[13px]! font-bold! text-white! bg-[#27427f]! tabular-nums!"
                            >
                              {p}
                            </span>
                          ) : (
                            <Link
                              key={p}
                              href={pageHref(p)}
                              prefetch
                              scroll={false}
                              aria-label={`Page ${p}`}
                              className="w-9! h-9! flex! items-center! justify-center! rounded-lg! text-[13px]! font-medium! text-gray-600! hover:bg-gray-100! hover:text-[#27427f]! transition-colors! no-underline! tabular-nums!"
                            >
                              {p}
                            </Link>
                          )
                        )}
                        {page < totalPages ? (
                          <Link
                            href={pageHref(page + 1)}
                            prefetch
                            scroll={false}
                            aria-label="Next page"
                            className="flex! items-center! gap-1! h-9! px-3.5! rounded-full! text-[13px]! font-semibold! text-gray-600! hover:bg-gray-100! hover:text-[#27427f]! transition-colors! no-underline!"
                          >
                            <span className="hidden! sm:inline!">Next</span>
                            <ChevronRight className="w-4! h-4!" />
                          </Link>
                        ) : (
                          <span className="flex! items-center! gap-1! h-9! px-3.5! rounded-full! text-[13px]! font-semibold! text-gray-300! cursor-default!">
                            <span className="hidden! sm:inline!">Next</span>
                            <ChevronRight className="w-4! h-4!" />
                          </span>
                        )}
                      </nav>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Right rail (xl+) ── */}
              <aside className="hidden! xl:block! w-[260px]! shrink-0! sticky! top-[64px]! max-h-[calc(100vh-80px)]! overflow-y-auto!">
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
