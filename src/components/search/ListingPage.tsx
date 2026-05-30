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

// Keep legacy mappings for URLs
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
  { value: "", label: "Relevance" },
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
    location: initialLocality || initialCity,
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
      const url = buildListingUrl(
        newFilters.listingType as any,
        newFilters.propertyType,
        newFilters.location
      );
      router.push(`${url}?${params.toString()}`);
    } else {
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) params.set("sort", newSort);
    else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
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
    <div className="bg-[#f8f9fa]! min-h-screen">
      {/* Search Header / Filter Bar Area */}
      <div className="bg-white! border-b! border-gray-200! sticky! top-[72px]! z-40! shadow-sm!">
        <div className="container! mx-auto! px-4! py-3!">
          <Breadcrumbs items={breadcrumbItems} jsonLd />
          <div className="flex! flex-col! md:flex-row! items-center! justify-between! gap-4!">
            <div className="flex! flex-col!">
              <h1 className="text-2xl! font-bold! text-[#27427f]! capitalize!">{pageTitle}</h1>
              <p className="text-sm! text-gray-500!">
                {data?.total || 0} {data?.total === 1 ? "property" : "properties"} found
              </p>
            </div>
            
            <div className="flex! items-center! gap-3!">
              <div className="relative!">
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none! bg-white! border! border-gray-300! rounded-lg! px-4! py-2! pr-10! text-sm! focus:outline-none! focus:ring-2! focus:ring-[#27427f]! focus:border-transparent!"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ArrowUpDown className="absolute! right-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-500! pointer-events-none!" />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex! items-center! gap-2! border! rounded-lg! px-4! py-2! text-sm! font-medium! transition-colors! ${
                  showFilters ? 'bg-[#27427f]! text-white! border-[#27427f]!' : 'bg-white! text-gray-700! border-gray-300! hover:bg-gray-50!'
                }`}
              >
                <SlidersHorizontal className="w-4! h-4!" />
                Filters
              </button>
            </div>
          </div>
          
          {/* Active Filter Chips */}
          {(filters.keyword || filters.minPrice || filters.maxPrice || filters.bedrooms) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {filters.keyword && (
                <span className="inline-flex items-center gap-1 bg-[#27427f]/10 text-[#27427f] px-2 py-1 rounded text-xs font-semibold">
                  "{filters.keyword}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange({...filters, keyword: ""})} />
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1 bg-[#27427f]/10 text-[#27427f] px-2 py-1 rounded text-xs font-semibold">
                  Price: {filters.minPrice ? `₹${Number(filters.minPrice)/100000}L+` : '0'} to {filters.maxPrice ? `₹${Number(filters.maxPrice)/100000}L` : 'Any'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange({...filters, minPrice: "", maxPrice: ""})} />
                </span>
              )}
              {filters.bedrooms && (
                <span className="inline-flex items-center gap-1 bg-[#27427f]/10 text-[#27427f] px-2 py-1 rounded text-xs font-semibold">
                  {filters.bedrooms} BHK
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange({...filters, bedrooms: ""})} />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container! mx-auto! px-4! py-6!">
        <div className="flex! flex-col! lg:flex-row! gap-6!">
          
          {/* Sidebar / Filters / Map */}
          <div className={`${showFilters ? 'block' : 'hidden lg:block'} w-full lg:w-[320px] xl:w-[350px] shrink-0 space-y-6`}>
            {showFilters ? (
              <div className="sticky top-[160px] h-[calc(100vh-180px)]">
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
              </div>
            ) : (
              <div className="sticky! top-[160px]! h-[calc(100vh-180px)]! rounded-xl! overflow-hidden! shadow-sm! border! border-gray-200!">
                <MapPlaceholder city={filters.location || initialCity} locality={initialLocality} />
              </div>
            )}
          </div>
          
          {/* Main Content: Properties List */}
          <div className="flex-1! flex! flex-col! gap-6!">
            {loading ? (
              <div className="flex! flex-col! gap-6!">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white! rounded-xl! shadow-sm! border! border-gray-100! p-4! flex! flex-col! md:flex-row! gap-4! animate-pulse!">
                    <div className="w-full! md:w-[300px]! h-[200px]! bg-gray-200! rounded-lg!"></div>
                    <div className="flex-1! space-y-4! py-2!">
                      <div className="h-6! bg-gray-200! rounded! w-3/4!"></div>
                      <div className="h-4! bg-gray-200! rounded! w-1/2!"></div>
                      <div className="flex! gap-4! pt-4!">
                        <div className="h-10! bg-gray-200! rounded! w-24!"></div>
                        <div className="h-10! bg-gray-200! rounded! w-24!"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50! border! border-red-200! rounded-xl! p-8! text-center!">
                <p className="text-red-600! font-medium!">{error}</p>
                <button onClick={() => loadData()} className="mt-4! text-sm! font-semibold! text-[#27427f]! underline!">Try Again</button>
              </div>
            ) : data?.items.length === 0 ? (
              <div className="bg-white! rounded-xl! border! border-gray-200! p-12! text-center! flex! flex-col! items-center! shadow-sm!">
                <div className="w-20! h-20! bg-gray-50! rounded-full! flex! items-center! justify-center! mb-4!">
                  <Search className="w-10! h-10! text-gray-400!" />
                </div>
                <h3 className="text-xl! font-bold! text-gray-900! mb-2!">No properties found</h3>
                <p className="text-gray-500! max-w-md!">We couldn't find any properties matching your current criteria in {locationLabel}. Try adjusting your filters or searching a different area.</p>
                <button 
                  onClick={() => handleFilterChange({
                    keyword: "", propertyType: initialPropertyType, listingType: initialListingType, location: initialCity,
                    minPrice: "", maxPrice: "", minArea: "", maxArea: "", bedrooms: "", facing: "", furnishing: "", propertyAge: ""
                  })}
                  className="mt-6! px-6! py-2.5! bg-[#27427f]! text-white! rounded-lg! font-medium! hover:bg-[#1d3261]! transition-colors!"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex! flex-col! gap-6!">
                  {data?.items.map(item => {
                    const detailPath = getDetailPath(item);
                    const slug = detailPath.substring(1);
                    return (
                    <div key={item.id} className="bg-white! rounded-xl! shadow-sm! hover:shadow-md! border! border-gray-100! overflow-hidden! transition-all! flex! flex-col! md:flex-row! group!">
                      {/* Image section */}
                      <Link href={detailPath} className="relative! w-full! md:w-[320px]! shrink-0! block!">
                        <div className="aspect-[4/3]! w-full! overflow-hidden!">
                          <img 
                            src={getPhotoUrl(item)} 
                            alt={item.propertyname || 'Property'} 
                            className="w-full! h-full! object-cover! group-hover:scale-105! transition-transform! duration-500!"
                          />
                        </div>
                        <div className="absolute! top-3! left-3! flex! gap-2!">
                          <span className="px-2.5! py-1! bg-[#27427f]/90! backdrop-blur-sm! text-white! text-xs! font-bold! rounded-md! shadow-sm! uppercase! tracking-wider!">
                            {item.posttype === "Sell" ? "For Sale" : "For Rent"}
                          </span>
                        </div>
                      </Link>
                      
                      {/* Content section */}
                      <div className="p-5! flex! flex-col! flex-1!">
                        <div className="flex! justify-between! items-start! gap-4!">
                          <div>
                            <Link href={detailPath} className="hover:text-[#27427f]! transition-colors! no-underline!">
                              <h3 className="font-['Lexend',sans-serif]! text-lg! font-bold! text-gray-900! line-clamp-1!">{item.propertyname}</h3>
                            </Link>
                            <p className="text-sm! text-gray-500! flex! items-center! gap-1.5! mt-1.5!">
                              <MapPin className="w-4! h-4! shrink-0! text-gray-400!" />
                              <span className="line-clamp-1!">{item.sublocation || item.address}</span>
                            </p>
                          </div>
                          <div className="text-right! shrink-0!">
                            <div className="font-['Lexend',sans-serif]! text-xl! font-bold! text-[#27427f]!">
                              {formatPrice(item.posttype === "Sell" ? item.expectedsaleprice : item.monthly_rent)}
                            </div>
                            {item.posttype === "Sell" && getArea(item) && (
                              <div className="text-xs! text-gray-500! mt-1!">
                                {(Number(item.expectedsaleprice) / Number(getArea(item).split(' ')[0])).toFixed(0)} / sq.ft
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Specs row */}
                        <div className="flex! flex-wrap! items-center! gap-2! mt-4!">
                          {item.unittype && (
                            <span className="inline-flex! items-center! gap-1.5! rounded-lg! bg-[#27427f]/[0.04]! px-2.5! py-1.5! text-xs! font-semibold! text-[#27427f]/80!">
                              <Layers className="w-3.5! h-3.5!" />
                              {item.unittype}
                            </span>
                          )}
                          {getArea(item) && (
                            <span className="inline-flex! items-center! gap-1.5! rounded-lg! bg-[#27427f]/[0.04]! px-2.5! py-1.5! text-xs! font-semibold! text-[#27427f]/80!">
                              <Ruler className="w-3.5! h-3.5!" />
                              {getArea(item)}
                            </span>
                          )}
                          {getFacing(item) && (
                            <span className="inline-flex! items-center! gap-1.5! rounded-lg! bg-[#27427f]/[0.04]! px-2.5! py-1.5! text-xs! font-semibold! text-[#27427f]/80!">
                              <Compass className="w-3.5! h-3.5!" />
                              {getFacing(item)} Facing
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-auto! pt-4!">
                          <PropertySectionLinks slug={slug} compact />
                          
                          {/* Actions */}
                          <div className="mt-4! flex! items-center! justify-between! pt-4! border-t! border-gray-100!">
                            <div className="text-xs! font-medium! text-gray-500! bg-gray-100! px-2.5! py-1! rounded-full! whitespace-nowrap! truncate! max-w-[120px]! md:max-w-[140px]!">
                              {Object.values(PROPERTY_TYPES).find(p => p.apiValue === item.propertyType)?.label || item.propertyType}
                            </div>
                            <div className="flex! gap-3!">
                              <button className="flex! items-center! gap-2! px-4! py-2.5! rounded-xl! text-sm! font-semibold! text-[#27427f]! bg-[#eef2f9]! hover:bg-[#e4ebf5]! transition-colors!">
                                <Phone className="w-4! h-4!" />
                                Contact
                              </button>
                              <Link 
                                href={detailPath} 
                                className="flex! items-center! justify-center! px-4! py-2.5! rounded-xl! text-sm! font-semibold! text-white! bg-[#27427f]! hover:bg-[#1a2d59]! transition-colors! no-underline!"
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
                  <div className="flex! justify-center! mt-10!">
                    <div className="inline-flex! bg-white! rounded-xl! shadow-sm! border! border-gray-200! p-1!">
                      <button 
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set("page", String(page - 1));
                          router.push(`${pathname}?${params.toString()}`);
                        }}
                        disabled={page === 1}
                        className="p-2! rounded-lg! text-gray-500! hover:bg-gray-50! disabled:opacity-50! disabled:hover:bg-transparent!"
                      >
                        <ChevronLeft className="w-5! h-5!" />
                      </button>
                      <div className="flex! items-center! px-4! text-sm! font-medium! text-gray-700!">
                        Page {page} of {Math.ceil(data.total / data.limit)}
                      </div>
                      <button 
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set("page", String(page + 1));
                          router.push(`${pathname}?${params.toString()}`);
                        }}
                        disabled={page >= Math.ceil(data.total / data.limit)}
                        className="p-2! rounded-lg! text-gray-500! hover:bg-gray-50! disabled:opacity-50! disabled:hover:bg-transparent!"
                      >
                        <ChevronRight className="w-5! h-5!" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
