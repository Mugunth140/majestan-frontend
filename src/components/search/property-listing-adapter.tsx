import Link from "next/link";
import { MapPin, X, Ruler, Compass, Layers, Phone } from "lucide-react";
import { searchProperties, type PropertySearchItem } from "@/lib/api";
import { PROPERTY_TYPES, buildListingUrl } from "@/lib/seo-urls";
import { PropertySearchFilters, type FilterValues } from "./PropertySearchFilters";
import { PropertySectionLinks } from "@/components/site/property/property-navigation";
import type { ListingAdapter } from "./listing-adapter";

const PROPERTY_DETAIL_SUFFIX: Record<string, string> = {
  apartment:          "ap",
  villa:              "v",
  individual_portion: "ip",
  "independent-house":"ip",
  plot:               "p",
  farmland:           "fl",
  commercial:         "cs",
  "commercial-space": "cs",
  industrial:         "in",
  "industrial-space": "in",
  coworking:          "cw",
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
  if (num === 0) return "Price on Request";
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function PropertyListingCard({ item }: { item: PropertySearchItem }) {
  const detailPath = getDetailPath(item);
  const slug = detailPath.substring(1);
  return (
    <div className="bg-white! rounded-2xl! shadow-sm! hover:shadow-xl! border! border-gray-100/60! overflow-hidden! transition-all! duration-300! hover:-translate-y-1! flex! flex-col! md:flex-row! group!">

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
              {(() => {
                if (item.units && item.units.length >= 2) {
                  const prices = item.units.map(u => Number(u.price)).filter(p => !isNaN(p) && p > 0);
                  if (prices.length >= 2) {
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    if (min !== max) return `${formatPrice(min)} - ${formatPrice(max)}`;
                  }
                }
                return formatPrice(item.posttype === "Sell" ? item.expectedsaleprice : item.monthly_rent);
              })()}
            </div>
            {(() => {
              if (item.units && item.units.length >= 2) {
                const areas = item.units.map(u => Number(u.builtupAreaSqft || u.carpetAreaSqft)).filter(a => !isNaN(a) && a > 0);
                if (areas.length >= 2) {
                  const min = Math.min(...areas);
                  const max = Math.max(...areas);
                  if (min !== max) {
                    return (
                      <div className="text-xs! font-semibold! text-gray-400! mt-1! uppercase! tracking-wider!">
                        {min} - {max} sq.ft
                      </div>
                    );
                  }
                }
              }
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
          {(item.units && item.units.length >= 2) ? (
            <span className="flex! items-center! gap-2! text-sm! font-semibold! text-gray-700!">
              <Layers className="w-4! h-4! text-[#27427f]! opacity-60!" />
              {item.units.length} Plans
            </span>
          ) : item.unittype ? (
            <span className="flex! items-center! gap-2! text-sm! font-semibold! text-gray-700!">
              <Layers className="w-4! h-4! text-[#27427f]! opacity-60!" />
              {item.unittype}
            </span>
          ) : null}
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
  );
}

export function createPropertyAdapter(init: {
  initialListingType: "Sell" | "Rent";
  initialPropertyType: string;
  initialCity: string;
  initialLocality?: string;
  initialBedrooms?: number;
}): ListingAdapter<FilterValues, PropertySearchItem> {
  const resetFilters: FilterValues = {
    keyword: "", propertyType: init.initialPropertyType, listingType: init.initialListingType, location: init.initialCity,
    minPrice: "", maxPrice: "", minArea: "", maxArea: "", bedrooms: "", facing: "", furnishing: "", propertyAge: ""
  };

  return {
    limit: 12,
    sortOptions: SORT_OPTIONS,
    resetFilters,

    fetchItems: async ({ filters, sort, page }) => {
      return searchProperties({
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
    },

    getItemKey: (item) => item.id,

    renderCard: (item) => <PropertyListingCard key={item.id} item={item} />,

    renderFilters: ({ values, onChange, onReset }) => (
      <PropertySearchFilters
        values={values}
        onChange={onChange}
        onReset={onReset}
      />
    ),

    renderActiveChips: (filters, onChange) => {
      if (!(filters.keyword || filters.minPrice || filters.maxPrice || filters.bedrooms)) return null;
      return (
        <div className="bg-white! rounded-2xl! shadow-sm! border! border-gray-200/60! p-5!">
          <h3 className="text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-2!">Active Filters</h3>
          <div className="flex! flex-wrap! gap-1.5!">
            {filters.keyword && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                &ldquo;{filters.keyword}&rdquo;
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, keyword: ""})} />
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Price: {filters.minPrice ? `₹${Number(filters.minPrice)/100000}L+` : '0'} to {filters.maxPrice ? `₹${Number(filters.maxPrice)/100000}L` : 'Any'}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, minPrice: "", maxPrice: ""})} />
              </span>
            )}
            {filters.bedrooms && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                {filters.bedrooms} BHK
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, bedrooms: ""})} />
              </span>
            )}
          </div>
        </div>
      );
    },

    buildTitle: (filters) => {
      const propertyTypeLabel = Object.values(PROPERTY_TYPES).find(p => p.apiValue === filters.propertyType)?.label || filters.propertyType;
      const listingTypeLabel = filters.listingType === "Rent" ? "For Rent" : "For Sale";
      const locationLabel = filters.location ? filters.location.replace(/-/g, ' ') : "Coimbatore";
      return `${propertyTypeLabel} ${listingTypeLabel} in ${locationLabel}`;
    },

    buildBreadcrumbs: (filters) => {
      const propertyTypeLabel = Object.values(PROPERTY_TYPES).find(p => p.apiValue === filters.propertyType)?.label || filters.propertyType;
      const listingTypeLabel = filters.listingType === "Rent" ? "For Rent" : "For Sale";
      const listingTypeSlug = filters.listingType === "Rent" ? "for-rent" : "for-sale";
      const locationLabel = filters.location ? filters.location.replace(/-/g, ' ') : "Coimbatore";
      return [
        { label: listingTypeLabel, href: `/${listingTypeSlug}/${filters.propertyType}/${init.initialCity}` },
        { label: propertyTypeLabel, href: `/${listingTypeSlug}/${filters.propertyType}/${init.initialCity}` },
        { label: locationLabel }
      ];
    },

    mapCity: (filters) => filters.location || init.initialCity,
    mapLocality: () => init.initialLocality,

    emptyTitle: "No properties found",
    emptyHint: (filters) => {
      const locationLabel = filters.location ? filters.location.replace(/-/g, ' ') : "Coimbatore";
      return `We couldn't find any properties matching your current criteria in ${locationLabel}. Try adjusting your filters or exploring a different area.`;
    },

    syncUrl: ({ filters, sort, pathname }) => {
      const params = new URLSearchParams();
      if (filters.keyword) params.set("keyword", filters.keyword);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.minArea) params.set("minArea", filters.minArea);
      if (filters.maxArea) params.set("maxArea", filters.maxArea);
      if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
      if (filters.facing) params.set("facing", filters.facing);
      if (filters.furnishing) params.set("furnishing", filters.furnishing);
      if (filters.propertyAge) params.set("propertyAge", filters.propertyAge);
      if (sort) params.set("sort", sort);

      // Check if listingType, propertyType, or location changed requiring a URL route change
      if (
        filters.listingType !== init.initialListingType ||
        filters.propertyType !== init.initialPropertyType ||
        filters.location !== (init.initialLocality || init.initialCity)
      ) {
        // Determine city and locality correctly for URL builder
        const urlCity = filters.location ? filters.location : init.initialCity;

        const url = buildListingUrl(
          filters.listingType as any,
          filters.propertyType,
          urlCity
        );

        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      } else {
        const queryString = params.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
      }
    },

    filtersFromParams: (searchParams) => ({
      keyword: searchParams.get("keyword") || "",
      propertyType: init.initialPropertyType,
      listingType: init.initialListingType,
      location: init.initialLocality || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minArea: searchParams.get("minArea") || "",
      maxArea: searchParams.get("maxArea") || "",
      bedrooms: searchParams.get("bedrooms") || (init.initialBedrooms ? String(init.initialBedrooms) : ""),
      facing: searchParams.get("facing") || "",
      furnishing: searchParams.get("furnishing") || "",
      propertyAge: searchParams.get("propertyAge") || "",
    }),
  };
}
