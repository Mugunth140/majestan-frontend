import Link from "next/link";
import { MapPin, X, Ruler, Compass, Phone, BedDouble, Bath, Building2, Sofa, CalendarDays, Car, BadgeCheck, Sparkles, Grid3X3, MapPinned, Images } from "lucide-react";
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

function nzNum(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return !isNaN(n) && n > 0 ? n : null;
}

function fmtArea(v: unknown): string | null {
  const n = nzNum(v);
  return n == null ? null : `${n.toLocaleString("en-IN")} sq.ft`;
}

function getDetails(item: PropertySearchItem): Record<string, any> {
  const raw = (item as any).__propertyDetails__ ?? (item as any).propertyDetails ?? (item as any).details ?? {};
  return typeof raw === "object" && raw !== null ? raw : {};
}

function getArea(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  return (
    fmtArea(d.carpetArea) ??
    fmtArea(d.superBuiltUpArea) ??
    fmtArea(d.areaSqft) ??
    fmtArea((item as any).sq_ft) ??
    fmtArea((item as any).build_up_area) ??
    fmtArea((item as any).buildup_area) ??
    (nzNum((item as any).cents) != null ? `${(item as any).cents} cents` : null) ??
    (nzNum((item as any).acres) != null ? `${(item as any).acres} acres` : null)
  );
}

function getFacing(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  return d.propertyFacing ?? item.facing ?? item.facing_direction ?? null;
}

function getFurnishing(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  if (d.furnished === true) return "Furnished";
  if (typeof d.furnishing_status === "string" && d.furnishing_status) return d.furnishing_status;
  return (item as any).furnishing_status ?? null;
}

function getFloor(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  if (d.floorNumber == null || String(d.floorNumber).trim() === "") return null;
  return d.totalFloors ? `Floor ${d.floorNumber} of ${d.totalFloors}` : `Floor ${d.floorNumber}`;
}

function getAge(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  return d.propertyAge ?? (item as any).property_age ?? (item as any).ageofproperty ?? (item as any).age_of_property ?? null;
}

function getParking(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  const n = nzNum(d.parking);
  if (n != null) return `${n} Parking`;
  if (d.guestParking) return "Guest Parking";
  return null;
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
  const d = getDetails(item);
  const area = getArea(item);
  const facing = getFacing(item);
  const furnishing = getFurnishing(item);
  const floor = getFloor(item);
  const age = getAge(item);
  const parking = getParking(item);
  const bathrooms = nzNum(d.bathrooms) != null ? `${d.bathrooms} Bath` : null;
  const possession = typeof d.possessionStatus === "string" && d.possessionStatus ? d.possessionStatus : null;
  const verified = (item as any).verificationStatus === "Verified";
  const propertyCode = (item as any).propertyCode as string | undefined;

  const pillIcon = "w-3! h-3! text-[#27427f]/60! shrink-0!";
  const specPills: { icon: React.ReactNode; label: string }[] = [];

  const sectionLinks = [
    { href: `${detailPath}/amenities`, label: "Amenities", icon: <Sparkles className="w-3.5! h-3.5!" /> },
    { href: `${detailPath}/floor-plan`, label: "Floor Plan", icon: <Grid3X3 className="w-3.5! h-3.5!" /> },
    { href: `${detailPath}/locality`, label: "Locality", icon: <MapPinned className="w-3.5! h-3.5!" /> },
    { href: `${detailPath}/photos`, label: "Photos", icon: <Images className="w-3.5! h-3.5!" /> },
  ];

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

  if (unitSpec) specPills.push({ icon: <BedDouble className={pillIcon} />, label: unitSpec });
  if (bathrooms) specPills.push({ icon: <Bath className={pillIcon} />, label: bathrooms });
  if (area) specPills.push({ icon: <Ruler className={pillIcon} />, label: area });
  if (facing) specPills.push({ icon: <Compass className={pillIcon} />, label: `${facing} Facing` });
  if (floor) specPills.push({ icon: <Building2 className={pillIcon} />, label: floor });
  if (furnishing) specPills.push({ icon: <Sofa className={pillIcon} />, label: furnishing });
  if (age) specPills.push({ icon: <CalendarDays className={pillIcon} />, label: age });
  if (parking) specPills.push({ icon: <Car className={pillIcon} />, label: parking });

  const hasSpecs = specPills.length > 0;

  return (
    <div className="bg-white! rounded-2xl! border! border-gray-100! shadow-[0_1px_4px_rgba(0,0,0,0.06)]! hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]! transition-shadow! duration-200! flex! flex-col! xl:flex-row! overflow-hidden! min-w-0!">

      {/* Image — relative wrapper so badge can be absolutely positioned */}
      <div className="relative! w-full! xl:w-[270px]! shrink-0! overflow-hidden! bg-gray-100!">
        <Link href={detailPath} className="block! w-full! h-full!">
          <div className="aspect-[16/10]! xl:aspect-auto! xl:absolute! xl:inset-0! xl:min-h-[264px]!">
            <img
              src={getPhotoUrl(item)}
              alt={item.propertyname || "Property"}
              className="w-full! h-full! object-cover!"
              loading="lazy"
            />
          </div>
        </Link>
        {/* Badges — absolutely positioned over image */}
        <div className="absolute! top-3! left-3! z-10! flex! gap-1.5!">
          <span className="px-2.5! py-1! bg-white! text-[#27427f]! text-[11px]! font-extrabold! rounded-md! shadow-sm! uppercase! tracking-wider!">
            {item.posttype === "Sell" ? "For Sale" : "For Rent"}
          </span>
          {verified && (
            <span className="px-2.5! py-1! bg-green-600! text-white! text-[11px]! font-extrabold! rounded-md! shadow-sm! uppercase! tracking-wider!">
              Verified
            </span>
          )}
        </div>
        {propertyCode && (
          <div className="absolute! bottom-3! left-3! z-10!">
            <span className="px-2! py-0.5! bg-black/55! text-white! text-[10px]! font-mono! font-bold! rounded! tracking-wider!">
              {propertyCode}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5! sm:p-6! flex! flex-col! flex-1! min-w-0! gap-0!">

        {/* Title + location */}
        <div className="min-w-0!">
          <Link href={detailPath} className="no-underline!">
            <h3 className="font-['Lexend',sans-serif]! text-[17px]! font-bold! text-gray-900! line-clamp-2! leading-snug! hover:text-[#27427f]! transition-colors! flex! items-center! gap-1.5!">
              <span className="line-clamp-2!">{item.propertyname}</span>
              {verified && <BadgeCheck className="w-4! h-4! text-green-600! shrink-0!" />}
            </h3>
          </Link>
          <p className="flex! items-center! gap-1.5! text-[13px]! text-gray-400! mt-1! min-w-0!">
            <MapPin className="w-3.5! h-3.5! shrink-0!" />
            <span className="truncate!">{item.sublocation || item.address}</span>
          </p>
        </div>

        {/* Spec pills */}
        {hasSpecs && (
          <div className="flex! flex-wrap! gap-1.5! mt-2.5!">
            {specPills.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex! items-center! gap-1.5! bg-[#27427f]/[0.07]! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold! whitespace-nowrap!"
              >
                {pill.icon}
                {pill.label}
              </span>
            ))}
          </div>
        )}

        {/* Price + possession */}
        <div className="mt-2.5! flex! flex-wrap! items-center! gap-x-3! gap-y-1!">
          <div className="font-['Lexend',sans-serif]! text-[22px]! font-extrabold! text-[#27427f]! leading-tight!">
            {priceDisplay}
          </div>
          {possession && (
            <span className="px-2! py-0.5! bg-green-50! border! border-green-200! text-green-700! text-[11px]! font-bold! rounded-md! uppercase! tracking-wide!">
              {possession}
            </span>
          )}
        </div>

        {/* Section shortcut buttons */}
        <div className="flex! flex-wrap! gap-2! mt-3! pt-3! border-t! border-gray-100!">
          {sectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex! items-center! gap-1.5! rounded-lg! bg-gray-50! border! border-gray-200/60! px-3! py-1.5! text-[11px]! font-bold! text-gray-700! no-underline! transition-all! hover:bg-[#27427f]! hover:text-white! hover:border-[#27427f]! hover:shadow-md! hover:shadow-[#27427f]/20! group!"
            >
              <span className="text-gray-400! group-hover:text-white/90! transition-colors!">
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions — always at bottom */}
        <div className="mt-auto! pt-4! flex! items-center! gap-2.5!">
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
