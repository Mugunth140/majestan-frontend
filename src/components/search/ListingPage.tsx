"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { searchProperties, type PropertySearchItem, type PropertySearchResponse } from "@/lib/api";
import { PROPERTY_TYPES, LISTING_TYPES, buildListingUrl } from "@/lib/seo-urls";
import { MapPin, Search, Home, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, X, Building2, Ruler, Compass, Layers, Phone } from "lucide-react";
import { MapPlaceholder } from "./MapPlaceholder";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { PropertySearchFilters, type FilterValues } from "./PropertySearchFilters";
import { PropertySectionLinks } from "@/components/site/property/property-navigation";

const PROPERTY_DETAIL_SUFFIX: Record<string, string> = {
  apartment: "ap",
  villa: "v",
  "independent-house": "ip",
  plot: "p",
  farmland: "fl",
  "commercial-space": "cs",
  "industrial-space": "in",
  coworking: "cw",
};

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "low_to_high", label: "Price: Low to High" },
  { value: "high_to_low", label: "Price: High to Low" },
  { value: "Area_low_to_high", label: "Area: Small to Large" },
  { value: "Area_high_to_low", label: "Area: Large to Small" },
];

function getDetailPath(item: PropertySearchItem & { canonicalSlug?: string }): string {
  if (item.canonicalSlug) return `/${item.canonicalSlug}`;
  
  const slug = item.slug_url?.trim() || (typeof item.slug === "string" ? item.slug.trim() : "");
  if (slug) return `/${slug}`;
  
  // Fallback if no slug
  const suffix = PROPERTY_DETAIL_SUFFIX[item.propertyType] ?? "ap";
  return `/${item.propertyType}-${item.id}-${suffix}${item.id}`;
}

function getPhotoUrl(item: any): string {
  // Support new unified schema
  if (item.images && item.images.length > 0) {
    // Sort by isPrimary first, then return the first one
    const primary = item.images.find((img: any) => img.isPrimary);
    if (primary && primary.imageUrl) return primary.imageUrl;
    if (item.images[0].imageUrl) return item.images[0].imageUrl;
  }
  if (item.propertyImages && item.propertyImages.length > 0) {
    const primary = item.propertyImages.find((img: any) => img.isPrimary);
    if (primary && primary.imageUrl) return primary.imageUrl;
    if (item.propertyImages[0].imageUrl) return item.propertyImages[0].imageUrl;
  }

  // Support legacy
  const photo = item.photo1;
  if (!photo) return "/assets/images/home/apartment-buy.png";
  if (photo.startsWith("http")) return photo;
  return photo;
}

function getArea(item: PropertySearchItem): string | null {
  if (item.sq_ft && item.sq_ft !== "0") return `${item.sq_ft} sq.ft`;
  if (item.cents && item.cents !== "0") return `${item.cents} cents`;
  if (item.acres && item.acres !== "0") return `${item.acres} acres`;
  if (item.build_up_area && item.build_up_area !== "0") return `${item.build_up_area} sq.ft`;
  return null;
}

function getFacing(item: PropertySearchItem): string | null {
  return item.facing ?? item.facing_direction ?? null;
}

function formatPrice(value: string | number | undefined | null): string {
  if (!value) return "Price on Request";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

interface ListingPageProps {
  initialListingType: "Sell" | "Rent";
  initialPropertyType: string;
  initialCity: string;
  initialLocality?: string;
  initialSearchData?: PropertySearchResponse | null;
}

export function ListingPage({
  initialListingType,
  initialPropertyType,
  initialCity,
  initialLocality,
  initialSearchData
}: ListingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [data, setData] = useState<PropertySearchResponse | null>(initialSearchData || null);
  const [loading, setLoading] = useState(!initialSearchData);
  const [error, setError] = useState<string | null>(null);
  
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "";
  
  const [filters, setFilters] = useState<FilterValues>({
    keyword: searchParams.get("keyword") || "",
    propertyType: initialPropertyType,
    listingType: initialListingType,
    location: initialLocality || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    facing: searchParams.get("facing") || "",
    furnishing: searchParams.get("furnishing") || "",
    propertyAge: searchParams.get("propertyAge") || "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchProperties({
        listingType: filters.listingType,
        propertyType: filters.propertyType,
        location: filters.location,
        propertyName: filters.keyword,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        bedrooms: filters.bedrooms,
        facing: filters.facing,
        furnishing: filters.furnishing,
        propertyAge: filters.propertyAge,
        sort,
        page,
        limit: 12,
      });
      setData(res);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [filters, page, sort]);

  // Initial load or query param changes
  useEffect(() => {
    if (!initialSearchData || searchParams.toString() !== "") {
      loadData();
    }
  }, [loadData, searchParams]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.keyword) params.set("keyword", newFilters.keyword);
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
    if (newFilters.minArea) params.set("minArea", newFilters.minArea);
    if (newFilters.maxArea) params.set("maxArea", newFilters.maxArea);
    if (newFilters.bedrooms) params.set("bedrooms", newFilters.bedrooms);
    if (newFilters.facing) params.set("facing", newFilters.facing);
    if (newFilters.furnishing) params.set("furnishing", newFilters.furnishing);
    if (newFilters.propertyAge) params.set("propertyAge", newFilters.propertyAge);
    if (sort) params.set("sort", sort);
    
    // Check if listingType, propertyType, or location changed requiring a URL route change
    if (
      newFilters.listingType !== initialListingType || 
      newFilters.propertyType !== initialPropertyType || 
      newFilters.location !== (initialLocality || initialCity)
    ) {
      // Determine city and locality correctly for URL builder
      const urlCity = newFilters.location ? newFilters.location : initialCity;
      
      const url = buildListingUrl(
        newFilters.listingType as any,
        newFilters.propertyType,
        urlCity
      );
      
      const queryString = params.toString();
      router.push(queryString ? `${url}?${queryString}` : url);
    } else {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) params.set("sort", newSort);
    else params.delete("sort");
    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const propertyTypeLabel = Object.values(PROPERTY_TYPES).find(p => p.apiValue === filters.propertyType)?.label || filters.propertyType;
  const listingTypeLabel = filters.listingType === "Rent" ? "For Rent" : "For Sale";
  const listingTypeSlug = filters.listingType === "Rent" ? "for-rent" : "for-sale";
  const locationLabel = filters.location ? filters.location.replace(/-/g, ' ') : "Coimbatore";
  
  const pageTitle = `${propertyTypeLabel} ${listingTypeLabel} in ${locationLabel}`;

  const breadcrumbItems = [
    { label: listingTypeLabel, href: `/${listingTypeSlug}/${filters.propertyType}/${initialCity}` },
    { label: propertyTypeLabel, href: `/${listingTypeSlug}/${filters.propertyType}/${initialCity}` },
    { label: locationLabel }
  ];

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
            <PropertySearchFilters 
              values={filters} 
              onChange={handleFilterChange}
              onReset={() => {
                handleFilterChange({
                  keyword: "", propertyType: initialPropertyType, listingType: initialListingType, location: initialCity,
                  minPrice: "", maxPrice: "", minArea: "", maxArea: "", bedrooms: "", facing: "", furnishing: "", propertyAge: ""
                });
              }}
            />


            {/* Active Filters */}
            {(filters.keyword || filters.minPrice || filters.maxPrice || filters.bedrooms) && (
              <div className="bg-white! rounded-2xl! shadow-sm! border! border-gray-200/60! p-5!">
                <h3 className="text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-2!">Active Filters</h3>
                <div className="flex! flex-wrap! gap-1.5!">
                  {filters.keyword && (
                    <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                      &ldquo;{filters.keyword}&rdquo;
                      <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => handleFilterChange({...filters, keyword: ""})} />
                    </span>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                      Price: {filters.minPrice ? `₹${Number(filters.minPrice)/100000}L+` : '0'} to {filters.maxPrice ? `₹${Number(filters.maxPrice)/100000}L` : 'Any'}
                      <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => handleFilterChange({...filters, minPrice: "", maxPrice: ""})} />
                    </span>
                  )}
                  {filters.bedrooms && (
                    <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                      {filters.bedrooms} BHK
                      <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => handleFilterChange({...filters, bedrooms: ""})} />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Map at the bottom */}
            <div className="h-[280px]! rounded-2xl! overflow-hidden! shadow-sm! border! border-gray-200/60!">
              <MapPlaceholder city={filters.location || initialCity} locality={initialLocality} />
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
                  {SORT_OPTIONS.map((opt) => (
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
                <h3 className="text-2xl! font-extrabold! text-gray-900! mb-3! font-['Lexend',sans-serif]!">No properties found</h3>
                <p className="text-gray-500! max-w-md! mb-8!">We couldn't find any properties matching your current criteria in {locationLabel}. Try adjusting your filters or exploring a different area.</p>
                <button 
                  onClick={() => handleFilterChange({
                    keyword: "", propertyType: initialPropertyType, listingType: initialListingType, location: initialCity,
                    minPrice: "", maxPrice: "", minArea: "", maxArea: "", bedrooms: "", facing: "", furnishing: "", propertyAge: ""
                  })}
                  className="px-8! py-3! bg-[#27427f]! text-white! rounded-xl! font-bold! hover:bg-[#1d3261]! hover:shadow-lg! hover:-translate-y-0.5! transition-all!"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex! flex-col! gap-6!">
                  {data?.items.map(item => {
                    const detailPath = getDetailPath(item);
                    const slug = detailPath.substring(1);
                    return (
                    <div key={item.id} className="bg-white! rounded-2xl! shadow-sm! hover:shadow-xl! border! border-gray-100/60! overflow-hidden! transition-all! duration-300! hover:-translate-y-1! flex! flex-col! md:flex-row! group!">
                      
                      {/* Image section */}
                      <Link href={detailPath} className="relative! w-full! md:w-[340px]! shrink-0! block! overflow-hidden!">
                        <div className="aspect-[4/3]! md:h-full! w-full!">
                          <img 
                            src={getPhotoUrl(item)} 
                            alt={item.propertyname || 'Property'} 
                            className="w-full! h-full! object-cover! group-hover:scale-110! transition-transform! duration-700! ease-out!"
                          />
                          <div className="absolute! inset-0! bg-gradient-to-t! from-black/50! via-transparent! to-transparent! opacity-0! group-hover:opacity-100! transition-opacity! duration-300!"></div>
                        </div>
                        <div className="absolute! top-4! left-4! flex! gap-2!">
                          <span className="px-3! py-1.5! bg-white/95! backdrop-blur-md! text-[#27427f]! text-xs! font-extrabold! rounded-lg! shadow-sm! uppercase! tracking-wider!">
                            {item.posttype === "Sell" ? "For Sale" : "For Rent"}
                          </span>
                        </div>
                      </Link>
                      
                      {/* Content section */}
                      <div className="p-6! flex! flex-col! flex-1!">
                        <div className="flex! justify-between! items-start! gap-4!">
                          <div className="flex-1!">
                            <Link href={detailPath} className="hover:text-[#27427f]! transition-colors! no-underline!">
                              <h3 className="font-['Lexend',sans-serif]! text-xl! font-bold! text-gray-900! line-clamp-2! leading-tight!">{item.propertyname}</h3>
                            </Link>
                            <p className="text-sm! font-medium! text-gray-500! flex! items-center! gap-1.5! mt-2!">
                              <MapPin className="w-4! h-4! shrink-0! text-gray-400!" />
                              <span className="line-clamp-1!">{item.sublocation || item.address}</span>
                            </p>
                          </div>
                          <div className="text-right! shrink-0!">
                            <div className="font-['Lexend',sans-serif]! text-2xl! font-extrabold! text-[#27427f]!">
                              {formatPrice(item.posttype === "Sell" ? item.expectedsaleprice : item.monthly_rent)}
                            </div>
                            {(() => {
                              const area = getArea(item);
                              if (item.posttype === "Sell" && area) {
                                return (
                                  <div className="text-xs! font-semibold! text-gray-400! mt-1! uppercase! tracking-wider!">
                                    {(Number(item.expectedsaleprice) / Number(area.split(' ')[0])).toFixed(0)} / sq.ft
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                        
                        {/* Specs row */}
                        <div className="flex! flex-wrap! items-center! gap-5! mt-5! pb-5! border-b! border-gray-100/80!">
                          {item.unittype && (
                            <span className="flex! items-center! gap-2! text-sm! font-semibold! text-gray-700!">
                              <Layers className="w-4! h-4! text-[#27427f]! opacity-60!" />
                              {item.unittype}
                            </span>
                          )}
                          {getArea(item) && (
                            <span className="flex! items-center! gap-2! text-sm! font-semibold! text-gray-700!">
                              <Ruler className="w-4! h-4! text-[#27427f]! opacity-60!" />
                              {getArea(item)}
                            </span>
                          )}
                          {getFacing(item) && (
                            <span className="flex! items-center! gap-2! text-sm! font-semibold! text-gray-700!">
                              <Compass className="w-4! h-4! text-[#27427f]! opacity-60!" />
                              {getFacing(item)} Facing
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-auto! pt-5!">
                          <PropertySectionLinks slug={slug} compact />
                          
                          {/* Actions */}
                          <div className="mt-5! flex! items-center! justify-between! pt-5! border-t! border-gray-100/80!">
                            {/* <div className="text-xs! font-bold! text-gray-500! uppercase! tracking-wider! bg-gray-50! px-3! py-1.5! rounded-lg! whitespace-nowrap!">
                              {Object.values(PROPERTY_TYPES).find(p => p.apiValue === item.propertyType)?.label || item.propertyType}
                            </div> */}
                            <div className="flex! gap-3!">
                              <button className="flex! items-center! gap-2! px-5! py-2.5! rounded-xl! text-sm! font-bold! text-[#27427f]! bg-[#27427f]/5! hover:bg-[#27427f]/15! transition-colors!">
                                <Phone className="w-4! h-4!" />
                                <span className="hidden! sm:inline!">Contact</span>
                              </button>
                              <Link 
                                href={detailPath} 
                                className="flex! items-center! justify-center! px-5! py-2.5! rounded-xl! text-sm! font-bold! text-white! bg-[#27427f]! hover:bg-[#1a2d59]! hover:shadow-lg! hover:shadow-[#27427f]/20! transition-all! no-underline!"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>

                {/* Pagination */}
                {data && data.total > data.limit && (
                  <div className="flex! justify-center! mt-12!">
                    <div className="inline-flex! bg-white! rounded-2xl! shadow-sm! border! border-gray-100/60! p-1.5!">
                      <button 
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set("page", String(page - 1));
                          router.push(`${pathname}?${params.toString()}`);
                        }}
                        disabled={page === 1}
                        className="p-2.5! rounded-xl! text-gray-500! hover:bg-gray-50! disabled:opacity-40! disabled:hover:bg-transparent! transition-colors!"
                      >
                        <ChevronLeft className="w-5! h-5!" />
                      </button>
                      <div className="flex! items-center! px-6! text-sm! font-bold! text-gray-700!">
                        Page {page} of {Math.ceil(data.total / data.limit)}
                      </div>
                      <button 
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set("page", String(page + 1));
                          router.push(`${pathname}?${params.toString()}`);
                        }}
                        disabled={page >= Math.ceil(data.total / data.limit)}
                        className="p-2.5! rounded-xl! text-gray-500! hover:bg-gray-50! disabled:opacity-40! disabled:hover:bg-transparent! transition-colors!"
                      >
                        <ChevronRight className="w-5! h-5!" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
