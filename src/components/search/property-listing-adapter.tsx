import Link from "next/link";
import { MapPin, X, Ruler, Compass, Layers, Phone } from "lucide-react";
import { searchProperties, type PropertySearchItem } from "@/lib/api";
import { PROPERTY_TYPES, buildListingUrl } from "@/lib/seo-urls";
import { PropertySearchFilters, type FilterValues } from "./PropertySearchFilters";
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

function getArea(item: PropertySearchItem & { isProject?: boolean, ranges?: any }): string | null {
  if (item.isProject && item.ranges) {
    if (item.ranges.minArea && item.ranges.maxArea && item.ranges.minArea !== item.ranges.maxArea) {
      return `${item.ranges.minArea} - ${item.ranges.maxArea} sq.ft`;
    }
    if (item.ranges.minArea) return `${item.ranges.minArea} sq.ft`;
  }
  const nonZero = (v: unknown) => typeof v === "string" && parseFloat(v) > 0;
  if (nonZero(item.sq_ft)) return `${item.sq_ft} sq.ft`;
  if (nonZero(item.cents)) return `${item.cents} cents`;
  if (nonZero(item.acres)) return `${item.acres} acres`;
  if (nonZero(item.build_up_area)) return `${item.build_up_area} sq.ft`;
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
  const rawArea = getArea(item);
  // Suppress zero/null area values like "0.00 sq.ft"
  const area = rawArea && !rawArea.match(/^0(\.0+)?\s/) ? rawArea : null;
  const facing = getFacing(item);

  const priceDisplay = (() => {
    if ((item as any).isProject && (item as any).ranges && (item as any).ranges.unitsCount >= 2) {
      const min = (item as any).ranges.minPrice;
      const max = (item as any).ranges.maxPrice;
      if (min != null && max != null && min !== max) return `${formatPrice(min)} – ${formatPrice(max)}`;
      if (min != null) return formatPrice(min);
    } else if (item.units && item.units.length >= 2) {
      const prices = item.units.map((u) => Number(u.price)).filter((p) => !isNaN(p) && p > 0);
      if (prices.length >= 2) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min !== max) return `${formatPrice(min)} – ${formatPrice(max)}`;
      }
    }
    return formatPrice(item.posttype === "Sell" ? item.expectedsaleprice : item.monthly_rent);
  })();

  const unitSpec = (() => {
    if ((item as any).isProject && (item as any).ranges?.unitsCount >= 2) {
      const ranges = (item as any).ranges;
      if (ranges.bhk?.length > 0) return `${ranges.bhk.join(", ")} BHK`;
      return `${ranges.unitsCount} Plans`;
    }
    if (item.units && item.units.length >= 2) return `${item.units.length} Plans`;
    if (item.unittype) return item.unittype;
    return null;
  })();

  const hasSpecs = !!(unitSpec || area || facing);

  return (
    <div className="bg-white! rounded-2xl! border! border-gray-100! shadow-[0_1px_4px_rgba(0,0,0,0.06)]! hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]! transition-shadow! duration-200! flex! flex-col! xl:flex-row! overflow-hidden! min-w-0!">

      {/* Image — relative wrapper so badge can be absolutely positioned */}
      <div className="relative! w-full! xl:w-[260px]! shrink-0! overflow-hidden! bg-gray-100!">
        <Link href={detailPath} className="block! w-full! h-full!">
          <div className="aspect-[16/10]! xl:aspect-auto! xl:absolute! xl:inset-0! xl:min-h-[230px]!">
            <img
              src={getPhotoUrl(item)}
              alt={item.propertyname || "Property"}
              className="w-full! h-full! object-cover!"
              loading="lazy"
            />
          </div>
        </Link>
        {/* Badge — absolutely positioned over image */}
        <div className="absolute! top-3! left-3! z-10!">
          <span className="px-2.5! py-1! bg-white! text-[#27427f]! text-[11px]! font-extrabold! rounded-md! shadow-sm! uppercase! tracking-wider!">
            {item.posttype === "Sell" ? "For Sale" : "For Rent"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5! flex! flex-col! flex-1! min-w-0! gap-0!">

        {/* Title + location */}
        <div className="min-w-0!">
          <Link href={detailPath} className="no-underline!">
            <h3 className="font-['Lexend',sans-serif]! text-[17px]! font-bold! text-gray-900! line-clamp-2! leading-snug! hover:text-[#27427f]! transition-colors!">
              {item.propertyname}
            </h3>
          </Link>
          <p className="flex! items-center! gap-1.5! text-[13px]! text-gray-400! mt-1! min-w-0!">
            <MapPin className="w-3.5! h-3.5! shrink-0!" />
            <span className="truncate!">{item.sublocation || item.address}</span>
          </p>
        </div>

        {/* Price */}
        <div className="mt-2.5!">
          <div className="font-['Lexend',sans-serif]! text-[22px]! font-extrabold! text-[#27427f]! leading-tight!">
            {priceDisplay}
          </div>
        </div>

        {/* Specs row — only shown when there's real data */}
        {hasSpecs && (
          <div className="flex! flex-wrap! items-center! gap-x-4! gap-y-1.5! mt-2.5! pt-2.5! border-t! border-gray-100!">
            {unitSpec && (
              <span className="flex! items-center! gap-1.5! text-[13px]! font-medium! text-gray-500!">
                <Layers className="w-3.5! h-3.5! text-[#27427f]/40! shrink-0!" />
                {unitSpec}
              </span>
            )}
            {area && (
              <span className="flex! items-center! gap-1.5! text-[13px]! font-medium! text-gray-500!">
                <Ruler className="w-3.5! h-3.5! text-[#27427f]/40! shrink-0!" />
                {area}
              </span>
            )}
            {facing && (
              <span className="flex! items-center! gap-1.5! text-[13px]! font-medium! text-gray-500!">
                <Compass className="w-3.5! h-3.5! text-[#27427f]/40! shrink-0!" />
                {facing} Facing
              </span>
            )}
          </div>
        )}

        {/* Actions — always at bottom */}
        <div className="mt-auto! pt-3.5! flex! items-center! gap-2.5!">
          <button className="flex! items-center! gap-2! px-4! py-2.5! rounded-lg! text-sm! font-bold! text-[#27427f]! border! border-[#27427f]/25! hover:bg-[#27427f]/5! hover:border-[#27427f]/50! transition-colors! cursor-pointer! whitespace-nowrap!">
            <Phone className="w-3.5! h-3.5!" />
            Enquire
          </button>
          <Link
            href={detailPath}
            className="flex! items-center! justify-center! px-5! py-2.5! rounded-lg! text-sm! font-bold! text-white! bg-[#27427f]! hover:bg-[#1e3a6e]! transition-colors! no-underline! whitespace-nowrap!"
          >
            View Details
          </Link>
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
      // Property listings show properties only. Projects live exclusively
      // on the /projects listing page (createProjectAdapter).
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
      location: searchParams.get("location") || init.initialLocality || init.initialCity, // Use param if present
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
