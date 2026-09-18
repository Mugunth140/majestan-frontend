"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, X, Phone, Sparkles, Grid3X3, MapPinned, Images, Share2, Check, BadgeCheck } from "lucide-react";
import { searchProperties, type PropertySearchItem } from "@/lib/api";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import {
  PROPERTY_TYPES,
  buildPseoSlug,
  BEDROOM_PROPERTY_TYPE_SLUGS,
  type PropertyTypeSlug,
} from "@/lib/seo-urls";
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
  return d.totalFloors ? `${d.floorNumber} of ${d.totalFloors}` : `${d.floorNumber}`;
}

function getAge(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  return d.propertyAge ?? (item as any).property_age ?? (item as any).ageofproperty ?? (item as any).age_of_property ?? null;
}

function getParking(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  const n = nzNum(d.parking);
  if (n != null) return `${n}`;
  if (d.guestParking) return "Guest Parking";
  return null;
}

function fmtShortDate(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return null;
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getMonth()];
  return `${String(dt.getDate()).padStart(2, "0")}-${mon}-${dt.getFullYear()}`;
}

function getTypeLabel(item: PropertySearchItem): string | null {
  const raw = Object.values(PROPERTY_TYPES).find((p) => p.apiValue === item.propertyType)?.label
    ?? (typeof item.propertyType === "string" ? item.propertyType : "");
  const pretty = raw.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  if (!pretty) return null;
  const titled = pretty.charAt(0).toUpperCase() + pretty.slice(1);
  return titled.length > 3 && titled.endsWith("s") ? titled.slice(0, -1) : titled;
}

function getAreaCell(item: PropertySearchItem): { label: string; value: string } | null {
  const d = getDetails(item);
  if (nzNum(d.superBuiltUpArea) != null) return { label: "Built-Up Area", value: fmtArea(d.superBuiltUpArea)! };
  if (nzNum(d.areaSqft) != null) return { label: "Built-Up Area", value: fmtArea(d.areaSqft)! };
  if (nzNum(d.carpetArea) != null) return { label: "Carpet Area", value: fmtArea(d.carpetArea)! };
  if (nzNum((item as any).cents) != null) return { label: "Plot Area", value: `${(item as any).cents} cents` };
  if (nzNum((item as any).acres) != null) return { label: "Plot Area", value: `${(item as any).acres} acres` };
  return null;
}

function getPossession(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  if (typeof d.possessionStatus === "string" && d.possessionStatus.trim()) return d.possessionStatus.trim();
  return fmtShortDate((item as any).availableFrom);
}

function trimNum(n: number): string {
  return String(parseFloat(n.toFixed(2)));
}

function formatPrice(value: string | number | undefined | null): string {
  if (!value) return "Price on Request";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (num === 0) return "Price on Request";
  if (num >= 10000000) return `₹ ${trimNum(num / 10000000)} Cr`;
  if (num >= 100000) return `₹ ${trimNum(num / 100000)} Lakh`;
  return `₹ ${num.toLocaleString("en-IN")}`;
}

function isReraVerified(item: PropertySearchItem): boolean {
  const v = (item as any).reraNumber;
  if (typeof v !== "string") return false;
  const t = v.trim().toLowerCase();
  return t !== "" && t !== "not applicable" && t !== "n/a" && t !== "na" && t !== "none" && t !== "-";
}

function capFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function getLocationLabel(item: PropertySearchItem): string {
  const sub = capFirst((item.sublocation || "").trim());
  const city = ((item as any).city || "").trim();
  if (sub && city && sub.toLowerCase() !== city.toLowerCase()) return `${sub}, ${city}`;
  return sub || city || item.address || "";
}

function getPricePerSqft(item: PropertySearchItem, priceDisplay: string): string | null {
  if (priceDisplay.includes("-")) return null;
  const rawPrice = item.posttype === "Sell" ? (item as any).expectedsaleprice : (item as any).monthly_rent;
  const price = nzNum(rawPrice);
  if (price == null) return null;
  const d = getDetails(item);
  const area = nzNum(d.superBuiltUpArea) ?? nzNum(d.areaSqft) ?? nzNum(d.carpetArea);
  if (area == null) return null;
  return `₹${Math.round(price / area).toLocaleString("en-IN")}/sq.ft`;
}

function PropertyListingCard({ item }: { item: PropertySearchItem }) {
  const detailPath = getDetailPath(item);
  const facing = getFacing(item);
  const possession = getPossession(item);
  const locationLabel = getLocationLabel(item);
  const areaCell = getAreaCell(item);
  const reraVerified = isReraVerified(item);

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
      if (min != null && max != null && min !== max) return `${formatPrice(min)} - ${formatPrice(max)}`;
      if (min != null) return formatPrice(min);
    } else if (item.units && item.units.length >= 2) {
      const prices = item.units.map((u) => Number(u.price)).filter((p) => !isNaN(p) && p > 0);
      if (prices.length >= 2) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min !== max) return `${formatPrice(min)} - ${formatPrice(max)}`;
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

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}${detailPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.propertyname, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* user dismissed */
    }
  };

  const specCells: { label: string; value: React.ReactNode }[] = [];
  if (unitSpec) specCells.push({ label: "BHK", value: unitSpec });
  if (areaCell) specCells.push({ label: "Built-Up Area", value: areaCell.value });
  if (facing) specCells.push({ label: "Facing", value: facing });
  if (possession) specCells.push({ label: "Possession", value: possession });

  return (
    <div className="font-['Manrope',sans-serif]! bg-white! rounded-2xl! border! border-gray-200/70! shadow-sm! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]! transition-all! duration-300! flex! flex-col! lg:flex-row! overflow-hidden! min-w-0! group!">

      {/* Image — exact fixed square (300×300 on desktop, full-width square on
          mobile/tablet), flush to the card edges with zero padding/gaps.
          Fixed width AND height means it can never stretch or collapse. */}
      <div className="relative! w-full! aspect-square! lg:aspect-auto! lg:w-[300px]! lg:h-[300px]! shrink-0! overflow-hidden! bg-gray-100!">
        <Link href={detailPath} className="absolute! inset-0!">
          <img
            src={getPhotoUrl(item)}
            alt={item.propertyname || "Property"}
            className="w-full! h-full! object-cover! group-hover:scale-105! transition-transform! duration-700! ease-out!"
            loading="lazy"
          />
        </Link>
        {/* RERA verified badge — top-right over image */}
        {reraVerified && (
          <span className="absolute! top-3! right-3! z-10! inline-flex! items-center! gap-1! bg-white/90! backdrop-blur-sm! text-[#1d9bf0]! text-[10px]! font-bold! px-2! py-1! rounded-lg! shadow-sm!">
          <BadgeCheck className="w-3.5! h-3.5! fill-blue-400! text-white! stroke-1.5!"/>
            RERA
          </span>
        )}
      </div>

      <div className="p-5! flex! flex-col! flex-1! min-w-0! justify-center!">

        {/* Title + share */}
        <div className="flex! items-start! gap-2! min-w-0!">
          <div className="min-w-0! flex-1!">
            <Link href={detailPath} className="no-underline!">
              <h3 className="font-['Manrope',sans-serif]! text-[17px]! font-medium! text-[#27427f]! line-clamp-1! leading-snug! hover:text-[#1a2d59]! transition-colors!">
                {item.propertyname}
              </h3>
            </Link>
            <p className="flex! items-center! gap-1.5! text-[13px]! text-gray-500! mt-1! min-w-0!">
              <MapPin className="w-3.5! h-3.5! text-gray-400! shrink-0!" />
              <span className="truncate!">{locationLabel}</span>
            </p>
          </div>
          <WishlistButton propertyId={item.id} propertyType={item.propertyType} />
          <button
            onClick={handleShare}
            aria-label="Share this property"
            className="p-2! rounded-full! text-gray-400! hover:text-[#27427f]! hover:bg-gray-100! transition-colors! cursor-pointer! shrink-0!"
          >
            {copied ? <Check className="w-4! h-4! text-green-600!" /> : <Share2 className="w-4! h-4!" />}
          </button>
        </div>

        {/* Spec table */}
        {specCells.length > 0 && (
          <div className="mt-3! border-y! border-dashed! border-gray-200! py-3! grid! grid-cols-2! sm:grid-cols-4! gap-x-3! gap-y-4!">
            {specCells.map((cell) => (
              <div key={cell.label} className="min-w-0!">
                <div className="text-[11px]! text-gray-500! font-light!">{cell.label}</div>
                <div className="text-[13px]! font-medium! text-gray-800! truncate! mt-0.5!">{cell.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-3! flex! items-end! gap-3! leading-none!">
          <span className="text-[20px]! font-medium! text-[#27427f]!">{priceDisplay}</span>
          {(() => {
            const perSqft = getPricePerSqft(item, priceDisplay);
            return perSqft ? (
              <span className="text-[12px]! font-normal! text-gray-400!">{perSqft}</span>
            ) : null;
          })()}
        </div>

        {/* Section links */}
        <div className="flex! flex-wrap! items-center! justify-center! gap-x-7! gap-y-2! mt-3! pt-3! border-t! border-gray-100!">
          {sectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex! items-center! gap-1.5! text-[12px]! font-medium! text-gray-500! hover:text-[#27427f]! transition-colors! no-underline! group/link!"
            >
              <span className="text-gray-400! group-hover/link:text-[#27427f]! transition-colors!">
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-3! flex! flex-col! sm:flex-row! gap-2.5!">
          <button className="flex! flex-1! items-center! justify-center! gap-2! px-4! py-2.5! rounded-xl! text-sm! font-medium! text-[#27427f]! bg-[#eef2f7]! hover:bg-[#dde5f0]! transition-colors! cursor-pointer!">
            <Phone className="w-4! h-4!" />
            Enquire
          </button>
          <Link
            href={detailPath}
            className="flex! flex-1! items-center! justify-center! px-4! py-2.5! rounded-xl! text-sm! font-medium! text-white! bg-[#27427f]! hover:bg-[#1e3a6e]! transition-colors! no-underline!"
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
      const listingTypeLabel = filters.listingType === "Rent" ? "Rent" : "Sale";
      const locationLabel = filters.location ? filters.location.replace(/-/g, ' ') : "Coimbatore";
      return `${propertyTypeLabel} in ${locationLabel} for ${listingTypeLabel}`;
    },

    buildBreadcrumbs: (filters) => {
      const propertyTypeLabel =
        Object.values(PROPERTY_TYPES).find((p) => p.apiValue === filters.propertyType)?.label ||
        filters.propertyType;
      const listingTypeLabel = filters.listingType === "Rent" ? "For Rent" : "For Sale";
      const locationLabel = filters.location
        ? filters.location.replace(/-/g, " ")
        : init.initialCity;

      // Find the URL slug for the property type (e.g. "apartment" → "apartments")
      const ptSlug =
        (Object.entries(PROPERTY_TYPES).find(
          ([, data]) => data.apiValue === filters.propertyType
        )?.[0] as PropertyTypeSlug | undefined) || "apartments";

      // Parent breadcrumb points to the city-level PSEO page
      const parentSlug = buildPseoSlug(
        filters.listingType as "Sell" | "Rent",
        ptSlug,
        init.initialCity
      );

      return [
        { label: listingTypeLabel, href: `/${parentSlug}` },
        { label: propertyTypeLabel, href: `/${parentSlug}` },
        { label: locationLabel },
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
      if (filters.facing) params.set("facing", filters.facing);
      if (filters.furnishing) params.set("furnishing", filters.furnishing);
      if (filters.propertyAge) params.set("propertyAge", filters.propertyAge);
      if (sort) params.set("sort", sort);

      // Check if any PSEO-defining axis changed (listingType, propertyType, or
      // location). If so, navigate to the new canonical PSEO URL.
      const currentLocality = init.initialLocality || "";
      const filterLocationIsLocality = filters.location && filters.location !== init.initialCity;

      if (
        filters.listingType !== init.initialListingType ||
        filters.propertyType !== init.initialPropertyType ||
        filters.location !== (init.initialLocality || init.initialCity)
      ) {
        // Find the URL slug for the property type
        const ptSlug =
          (Object.entries(PROPERTY_TYPES).find(
            ([, data]) => data.apiValue === filters.propertyType
          )?.[0] as PropertyTypeSlug | undefined) || "apartments";

        const newLocality = filterLocationIsLocality ? filters.location : undefined;

        // Only include bedrooms in the URL if this is a BHK-supporting type
        // and bedrooms is set. Bedrooms as a user filter appends as a query param.
        const url =
          "/" +
          buildPseoSlug(
            filters.listingType as "Sell" | "Rent",
            ptSlug,
            init.initialCity,
            newLocality || undefined
          );

        // If the user also has a bedrooms filter set, keep it as a query param
        // (not in the PSEO slug) since it wasn't part of the base PSEO definition.
        if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);

        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      } else {
        // Only location/listingType/propertyType unchanged — keep current pathname,
        // append bedrooms as query param if set (it's a user filter here)
        if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
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
