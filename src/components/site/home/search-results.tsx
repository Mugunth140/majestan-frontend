"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  searchProperties,
  type PropertySearchItem,
  type PropertySearchResponse,
} from "@/lib/api";
import {
  MapPin,
  Search,
  Home,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Building2,
  Ruler,
  Compass,
  Layers,
  Phone,
} from "lucide-react";
import { PropertySearchFilters, type FilterValues } from "@/components/search/PropertySearchFilters";
import { PropertySectionLinks } from "@/components/site/property/property-navigation";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";

/* ── Helpers ──────────────────────────────────────────────── */

const PROPERTY_DETAIL_SUFFIX: Record<string, string> = {
  apartment:          "ap",
  villa:              "v",
  individual_portion: "ip",
  "independent-house":"ip",
  independenthouse:   "ip",
  plot:               "p",
  farmland:           "fl",
  farmlands:          "fl",
  commercial:         "cs",
  "commercial-space": "cs",
  commercialspace:    "cs",
  industrial:         "in",
  "industrial-space": "in",
  industrialspace:    "in",
  coworking:          "cw",
};

const SORT_OPTIONS = [
  { value: "", label: "Newest First" },
  { value: "low_to_high", label: "Price: Low to High" },
  { value: "high_to_low", label: "Price: High to Low" },
  { value: "Area_low_to_high", label: "Area: Small to Large" },
  { value: "Area_high_to_low", label: "Area: Large to Small" },
];

function getDetailPath(item: PropertySearchItem): string {
  const slug = item.slug_url?.trim();
  const suffix = PROPERTY_DETAIL_SUFFIX[item.propertyType] ?? "ap";
  if (slug) return `/${slug}-${suffix}${item.id}`;
  return `/${item.propertyType}-${item.id}-${suffix}${item.id}`;
}

function getPhotoUrl(item: PropertySearchItem): string {
  const photo = item.photo1;
  if (!photo) return "/assets/images/home/apartment-buy.png";
  if (photo.startsWith("http")) return photo;
  return photo;
}

function getArea(item: PropertySearchItem): string | null {
  if (item.units && item.units.length >= 2) {
    const areas = item.units.map(u => Number(u.builtupAreaSqft || u.carpetAreaSqft)).filter(a => !isNaN(a) && a > 0);
    if (areas.length >= 2) {
      const min = Math.min(...areas);
      const max = Math.max(...areas);
      if (min !== max) return `${min} - ${max}`;
    }
  }

  const raw =
    item.build_up_area ??
    item.buildup_area ??
    item.carpet_area ??
    item.super_build_up_area ??
    item.plot_area ??
    item.totalarea ??
    item.unitsize ??
    item.project_area;
  if (!raw || raw === "0" || raw.trim() === "") return null;
  return raw;
}

function getUnitType(item: PropertySearchItem): string | null {
  if (item.units && item.units.length >= 2) {
    return `${item.units.length} Plans`;
  }
  return item.unittype ?? item.configuration ?? null;
}

function getFacing(item: PropertySearchItem): string | null {
  return item.facing ?? item.facing_direction ?? null;
}

function formatPrice(value: string | number | undefined | null): string {
  if (!value) return "Price on Request";
  const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (!Number.isFinite(num) || num <= 0) return "Price on Request";

  if (num >= 10000000) {
    const crores = (num / 10000000).toFixed(2).replace(/\.?0+$/, "");
    return `₹${crores} Cr`;
  }
  if (num >= 100000) {
    const lakhs = (num / 100000).toFixed(2).replace(/\.?0+$/, "");
    return `₹${lakhs} L`;
  }
  if (num >= 1000) {
    const thousands = (num / 1000).toFixed(1).replace(/\.?0+$/, "");
    return `₹${thousands}K`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

function getDisplayPrice(item: PropertySearchItem): { price: string; label: string } {
  if (item.units && item.units.length >= 2) {
    const prices = item.units.map(u => Number(u.price)).filter(p => !isNaN(p) && p > 0);
    if (prices.length >= 2) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min !== max) {
        return {
          price: `${formatPrice(min)} - ${formatPrice(max)}`,
          label: item.posttype === "Rent" ? "/ month" : "",
        };
      }
    }
  }

  if (item.posttype === "Rent") {
    return {
      price: formatPrice(item.monthly_rent),
      label: "/ month",
    };
  }
  return {
    price: formatPrice(item.expectedsaleprice),
    label: "",
  };
}

/* ── Loading Skeleton ─────────────────────────────────────── */

function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100">
      <div className="h-52 bg-gradient-to-br from-gray-200 to-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-lg bg-gray-200" />
        <div className="h-4 w-1/2 rounded-lg bg-gray-100" />
        <div className="flex gap-3 mt-4">
          <div className="h-8 w-20 rounded-lg bg-gray-100" />
          <div className="h-8 w-20 rounded-lg bg-gray-100" />
          <div className="h-8 w-20 rounded-lg bg-gray-100" />
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div className="h-6 w-24 rounded-lg bg-gray-200" />
          <div className="h-9 w-20 rounded-lg bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

/* ── Property Card ────────────────────────────────────────── */

function PropertyCard({ item }: { item: PropertySearchItem }) {
  const detailPath = getDetailPath(item);
  const slug = detailPath.substring(1);
  const photo = getPhotoUrl(item);
  const area = getArea(item);
  const unitType = getUnitType(item);
  const facing = getFacing(item);
  const { price, label } = getDisplayPrice(item);
  const isSale = item.posttype === "Sell";
  
  const typeLabel = Object.values(PROPERTY_TYPES).find(p => p.apiValue === item.propertyType)?.label || item.propertyType;

  return (
    <article className="group relative rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_35px_rgba(39,66,127,0.12)] overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <Link href={detailPath} className="relative block h-52 overflow-hidden">
        <img
          src={photo}
          alt={item.propertyname ?? "Property"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
            isSale
              ? "bg-[#27427f]/90 text-white"
              : "bg-[#ffc900]/90 text-[#27427f]"
          }`}
        >
          {isSale ? "For Sale" : "For Rent"}
        </span>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-[#27427f] uppercase tracking-wider shadow-md">
          <Building2 size={11} />
          {typeLabel}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={detailPath} className="no-underline">
          <h3 className="font-['Lexend',sans-serif] text-[16px] font-bold leading-snug text-[#161e2d] line-clamp-1 group-hover:text-[#27427f] transition-colors">
            {item.propertyname ?? "Unnamed Property"}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-gray-500">
          <MapPin size={13} className="shrink-0 text-gray-400" />
          <span className="truncate">
            {item.sublocation ?? "Coimbatore"}, Coimbatore
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {unitType && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#27427f]/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-[#27427f]/80">
              <Layers size={12} />
              {unitType}
            </span>
          )}
          {area && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#27427f]/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-[#27427f]/80">
              <Ruler size={12} />
              {area} sq.ft
            </span>
          )}
          {facing && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#27427f]/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-[#27427f]/80">
              <Compass size={12} />
              {facing}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-100 mt-4">
          <div>
            <p className="font-['Lexend',sans-serif] text-xl font-bold text-[#27427f] leading-none">
              {price}
            </p>
            {label && (
              <span className="text-[11px] font-medium text-gray-400 mt-0.5 block">
                {label}
              </span>
            )}
          </div>
          <Link
            href={detailPath}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#27427f] px-4 py-2.5 text-[12px] font-bold text-white no-underline transition-all duration-200 hover:bg-[#1a2d59] hover:shadow-lg"
          >
            View Details
          </Link>
        </div>
        
        {/* Quick Links */}
        <div className="mt-4 border-t border-gray-100">
          <PropertySectionLinks slug={slug} compact />
        </div>
      </div>
    </article>
  );
}

/* ── Empty State ──────────────────────────────────────────── */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#27427f]/5">
        <Search size={32} className="text-[#27427f]/40" />
      </div>
      <h3 className="font-['Lexend',sans-serif] text-xl font-bold text-[#161e2d] mb-2">
        No properties found
      </h3>
      <p className="text-sm text-gray-500 max-w-md">
        {query
          ? `We couldn't find any properties matching "${query}". Try adjusting your search criteria.`
          : "Try selecting a different property type or location to discover available properties."}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#27427f] px-6 py-3 text-[13px] font-bold text-white no-underline transition-all hover:bg-[#1a2d59] hover:shadow-lg"
      >
        <Home size={16} />
        Back to Home
      </Link>
    </div>
  );
}

/* ── Pagination ───────────────────────────────────────────── */

function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const getVisiblePages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#27427f] transition-all hover:bg-[#27427f] hover:text-white hover:border-[#27427f] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#27427f] disabled:hover:border-gray-200"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {getVisiblePages().map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm font-medium">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl px-3 text-[13px] font-bold transition-all ${
              p === page
                ? "bg-[#27427f] text-white shadow-lg shadow-[#27427f]/20"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-[#27427f]/5 hover:text-[#27427f] hover:border-[#27427f]/20"
            }`}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#27427f] transition-all hover:bg-[#27427f] hover:text-white hover:border-[#27427f] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#27427f] disabled:hover:border-gray-200"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

/* ── Main Component ───────────────────────────────────────── */

function SearchResultsInner({ initialFilters = {} }: { initialFilters?: Partial<FilterValues> }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<FilterValues>({
    keyword: initialFilters.keyword || searchParams.get("keyword") || searchParams.get("propertyName") || "",
    propertyType: initialFilters.propertyType || searchParams.get("propertyType") || "",
    listingType: initialFilters.listingType || searchParams.get("listingType") || "",
    location: initialFilters.location || searchParams.get("location") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    facing: searchParams.get("facing") || "",
    furnishing: searchParams.get("furnishing") || "",
    propertyAge: searchParams.get("propertyAge") || "",
  });

  const sort = searchParams.get("sort") ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [data, setData] = useState<PropertySearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchProperties({
        propertyType: filters.propertyType || undefined,
        listingType: filters.listingType || undefined,
        location: filters.location && filters.location.toLowerCase() !== "coimbatore" ? filters.location : undefined,
        propertyName: filters.keyword || undefined,
        sort: sort || undefined,
        page: currentPage,
        limit: 12,
      });
      setData(result);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to load properties. Please try again.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sort, currentPage]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const updateParams = (updates: Partial<FilterValues> & { page?: string, sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    updateParams(newFilters);
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (sortValue: string) => {
    updateParams({ sort: sortValue });
    setSortOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      keyword: "", propertyType: "", listingType: "", location: "",
      minPrice: "", maxPrice: "", minArea: "", maxArea: "", bedrooms: "", facing: "", furnishing: "", propertyAge: ""
    };
    setFilters(emptyFilters);
    router.push("/search");
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Newest First";

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* ── Hero Banner ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#27427f] pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-5 right-20 h-48 w-48 rounded-full bg-[#ffc900] blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="font-['Lexend',sans-serif] text-3xl md:text-5xl font-bold text-white mb-4">
              Find Your Perfect Property
            </h1>
            <p className="text-white/80 text-lg">
              Search through thousands of verified properties in Coimbatore
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-xl flex items-center">
            <div className="flex-1 flex items-center px-4 gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by property name, keyword..." 
                className="w-full py-3 text-gray-700 focus:outline-none"
                value={filters.keyword}
                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFilterChange(filters);
                }}
              />
            </div>
            <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
            <div className="flex-1 hidden md:flex items-center px-4 gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Location (e.g. Saravanampatti)" 
                className="w-full py-3 text-gray-700 focus:outline-none"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFilterChange(filters);
                }}
              />
            </div>
            <button 
              onClick={() => handleFilterChange(filters)}
              className="bg-[#27427f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a2d59] transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <Breadcrumbs items={[{ label: "Search" }]} jsonLd />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <span className="font-bold text-[#161e2d]">Filters</span>
            <button 
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="flex items-center gap-2 bg-[#f8f9fa] px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFiltersMobile ? "Hide" : "Show"}
            </button>
          </div>

          {/* Sidebar Filters */}
          <div className={`${showFiltersMobile ? 'block' : 'hidden'} lg:block w-full lg:w-[320px] shrink-0`}>
            <div className="sticky top-[100px] h-[calc(100vh-120px)] pb-10">
              <PropertySearchFilters 
                values={filters}
                onChange={handleFilterChange}
                onReset={clearFilters}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between mb-6">
              <div className="text-sm font-semibold text-gray-600">
                {isLoading ? (
                  "Searching..."
                ) : data ? (
                  <span className="text-[#27427f]">
                    Showing {data.total} result{data.total !== 1 ? "s" : ""}
                  </span>
                ) : (
                  "No results"
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  {currentSortLabel}
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                            sort === option.value || (!sort && option.value === "")
                              ? "bg-[#27427f] text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <X size={28} className="text-red-400" />
                </div>
                <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchResults}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#27427f] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#1a2d59]"
                >
                  Try Again
                </button>
              </div>
            ) : isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((item) => (
                    <PropertyCard key={`${item.propertyType}-${item.id}`} item={item} />
                  ))}
                </div>
                <Pagination
                  page={data.page}
                  total={data.total}
                  limit={data.limit}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <EmptyState query={filters.keyword || filters.location || filters.propertyType} />
            )}
          </div>
        </div>
      </div>

      {/* ── CTA Section ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 mt-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#27427f] to-[#1a2d59] px-8 py-12 md:px-16 md:py-16 text-center">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[#ffc900]" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white" />
          </div>
          <div className="relative z-10">
            <h2 className="font-['Lexend',sans-serif] text-3xl font-bold text-white mb-3">
              Can't find what you're looking for?
            </h2>
            <p className="text-white/80 text-base max-w-lg mx-auto mb-8">
              Our real estate experts can help you find the perfect property. Get personalized assistance today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ffc900] px-7 py-3.5 text-sm font-bold text-[#161e2d] transition-all hover:bg-[#f0bd00] hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Phone size={16} />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Export with Suspense boundary ─────────────────────────── */

export function SearchResults({ initialFilters }: { initialFilters?: Partial<FilterValues> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fa] pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchResultsInner initialFilters={initialFilters} />
    </Suspense>
  );
}
